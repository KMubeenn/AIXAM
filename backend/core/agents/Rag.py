# RAG.py
"""
RAG Pipeline - Retrieval-Augmented Generation with hybrid search.
Supports both Pinecone (cloud) and FAISS (local fallback) backends.
Uses hybrid retrieval: dense vectors + BM25 sparse + CrossEncoder reranking.
Includes Redis caching for query results.
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from rank_bm25 import BM25Okapi
from sentence_transformers import CrossEncoder
import os
from typing import List, Dict, Any, Optional

from core.utilities.DocReader import DocumentReader


def _get_redis_service():
    """Lazy import Redis service."""
    try:
        from core.services.redis_service import RedisService
        return RedisService
    except ImportError:
        return None


class RAGPipeline:
    """
    Retrieval-Augmented Generation pipeline with dual backend support:
    - Pinecone (primary) - cloud vector database with integrated embeddings
    - FAISS (fallback) - local vector store for offline/development
    
    Features:
    - Hybrid search: dense + BM25 sparse + CrossEncoder reranking
    - Document ingestion and chunking
    - Context retrieval for LLM pipelines
    """

    def __init__(
        self, 
        embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        chunk_size: int = 500, 
        chunk_overlap: int = 50,
        use_pinecone: bool = True
    ):
        """
        Initialize RAG pipeline.
        
        Args:
            embedding_model_name: HuggingFace model for FAISS embeddings
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
            use_pinecone: If True, try Pinecone first, else use FAISS only
        """
        # FAISS embedding model (for fallback and uploaded docs)
        self.embedding_model = HuggingFaceEmbeddings(model_name=embedding_model_name)

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        self.document_reader = DocumentReader()
        
        # FAISS vectorstore (local fallback)
        self.vectorstore: FAISS | None = None
        self.save_path = "faiss_index"
        
        # Pinecone service (cloud primary)
        self.pinecone_service = None
        self.use_pinecone = use_pinecone
        self._pinecone_available = False
        
        if use_pinecone:
            self._init_pinecone()
        
        # Initialize reranker once to avoid loading on every query
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        
        # Uploaded documents (stored in prompt, not vector DB)
        self.uploaded_docs: list[str] = []
    
    def _init_pinecone(self):
        """Initialize Pinecone connection if available."""
        try:
            from core.services.pinecone_service import get_pinecone_service
            self.pinecone_service = get_pinecone_service()
            self._pinecone_available = True
            print("[RAG] Pinecone service initialized successfully")
        except Exception as e:
            print(f"[RAG] Pinecone unavailable, using FAISS fallback: {e}")
            self._pinecone_available = False
    
    def read(self, path: str) -> None:
        """Read document from path and ingest into vectorstore."""
        file_path = os.path.abspath(path)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}") 
        self.ingest(self.document_reader.read(file_path))
    
    def set_docs_data(self, text: list[str]):
        """Add uploaded document text to context."""
        self.uploaded_docs.extend(text)

    def get_docs_data(self):
        """Get uploaded documents as context string."""
        if not self.uploaded_docs:
            return "No additional documents have been uploaded."
        return "\n".join(self.uploaded_docs)
        

    def ingest(self, raw_texts: list[str], save: bool = False) -> None:
        """
        Ingest documents into FAISS vectorstore (for uploaded docs).
        For constitution docs, use the ingestion script instead.
        
        Args:
            raw_texts: List of raw text strings
            save: Whether to save FAISS index to disk
        """
        if os.path.exists(self.save_path) and save:
            self.load(self.save_path)

        docs = [Document(page_content=t) for t in raw_texts]
        chunks = self.text_splitter.split_documents(docs)
        
        if self.vectorstore:
            self.vectorstore.add_documents(chunks)
        else:
            self.vectorstore = FAISS.from_documents(chunks, self.embedding_model)
        
        if save:
            self.save(self.save_path)

    def save(self, path: str = "faiss_index") -> None:
        """Save FAISS index to disk."""
        if not self.vectorstore:
            raise ValueError("No vectorstore to save. Run ingest() first.")
        self.vectorstore.save_local(path)

    def load(self, path: str = "faiss_index") -> None:
        """Load FAISS index from disk."""
        if not os.path.exists(path):
            raise FileNotFoundError(f"No FAISS index found at {path}")
        self.vectorstore = FAISS.load_local(
            path, self.embedding_model, allow_dangerous_deserialization=True
        )

    def _query_pinecone(self, question: str, k: int = 3, initial_k: int = 20) -> List[Document]:
        """
        Query Pinecone with hybrid search (dense + BM25 + reranking).
        
        Args:
            question: Query string
            k: Final number of results
            initial_k: Initial candidates to retrieve
            
        Returns:
            List of Document objects
        """
        if not self._pinecone_available or not self.pinecone_service:
            return []
        
        try:
            # Get dense results from Pinecone (searches all namespaces)
            results = self.pinecone_service.search_all_namespaces(
                query=question,
                top_k_per_namespace=initial_k // 5,  # Divide across 5 namespaces
                include_metadata=True
            )
            
            if not results:
                return []
            
            # Extract texts for BM25
            texts = [r["metadata"].get("text", "") for r in results]
            
            # Apply BM25 scoring
            tokenized_corpus = [text.split(" ") for text in texts]
            bm25 = BM25Okapi(tokenized_corpus)
            tokenized_query = question.split(" ")
            bm25_scores = bm25.get_scores(tokenized_query)
            
            # Combine with dense scores
            scored_results = [
                (r, r["score"] + bm25_score * 0.3)  # Weight BM25 lower
                for r, bm25_score in zip(results, bm25_scores)
            ]
            scored_results.sort(key=lambda x: x[1], reverse=True)
            
            # Apply reranking
            top_results = [r for r, _ in scored_results[:initial_k]]
            pairs = [[question, r["metadata"].get("text", "")] for r in top_results]
            rerank_scores = self.reranker.predict(pairs)
            
            # Final ranking
            reranked = [(r, score) for r, score in zip(top_results, rerank_scores)]
            reranked.sort(key=lambda x: x[1], reverse=True)
            
            # Convert to Document objects
            return [
                Document(
                    page_content=r["metadata"].get("text", ""),
                    metadata={
                        "source": r["metadata"].get("source_file", ""),
                        "document_name": r["metadata"].get("document_name", ""),
                        "article": r["metadata"].get("article", ""),
                        "section": r["metadata"].get("section", ""),
                        "page": r["metadata"].get("page_number", 0),
                    }
                )
                for r, _ in reranked[:k]
            ]
            
        except Exception as e:
            print(f"[RAG] Pinecone query error: {e}")
            return []

    def _query_faiss(self, question: str, k: int = 3, initial_k: int = 20) -> List[Document]:
        """
        Query FAISS with hybrid search (dense + BM25 + reranking).
        Original implementation for fallback.
        """
        if not self.vectorstore:
            return []
        
        dense_results = self.vectorstore.similarity_search(question, k=initial_k)
        
        if not dense_results:
            return []
     
        texts = [doc.page_content for doc in dense_results]
        tokenized_corpus = [text.split(" ") for text in texts]
        bm25 = BM25Okapi(tokenized_corpus)
        tokenized_query = question.split(" ")
        bm25_scores = bm25.get_scores(tokenized_query)
        
        scored_docs = [(doc, score) for doc, score in zip(dense_results, bm25_scores)]
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        bm25_filtered_docs = [doc for doc, _ in scored_docs]
     
        pairs = [[question, doc.page_content] for doc in bm25_filtered_docs]
        rerank_scores = self.reranker.predict(pairs)
        
        reranked_docs = [(doc, score) for doc, score in zip(bm25_filtered_docs, rerank_scores)]
        reranked_docs.sort(key=lambda x: x[1], reverse=True)
        
        return [doc for doc, _ in reranked_docs[:k]]

    def query(self, question: str, k: int = 3, initial_k: int = 20) -> List[Document]:
        """
        Run hybrid search with reranking and Redis caching.
        
        Pipeline:
        1. Check Redis cache
        2. Dense vector search (Pinecone or FAISS)
        3. BM25 sparse scoring
        4. CrossEncoder reranking
        5. Cache results in Redis
        
        Args:
            question: Query string
            k: Final number of results to return
            initial_k: Number of candidates to retrieve initially
        
        Returns:
            List[Document]: List of Document objects with page_content attribute
        """
        # Check Redis cache first
        redis = _get_redis_service()
        if redis and redis.is_available():
            try:
                cached = redis.get_rag_results(question)
                if cached:
                    print(f"[RAG] Cache HIT for query: {question[:50]}...")
                    # Reconstruct Document objects from cache
                    return [
                        Document(
                            page_content=r.get("page_content", ""),
                            metadata=r.get("metadata", {})
                        )
                        for r in cached
                    ]
            except Exception as e:
                print(f"[RAG] Redis cache error: {e}")
        
        results = []
        
        # Try Pinecone first
        if self.use_pinecone and self._pinecone_available:
            results = self._query_pinecone(question, k=k, initial_k=initial_k)
            if results:
                # Cache the results
                if redis and redis.is_available():
                    redis.set_rag_results(question, results)
                return results
            print("[RAG] Pinecone returned no results, falling back to FAISS")
        
        # Fallback to FAISS
        if not self.vectorstore:
            try:
                self.load()
            except FileNotFoundError:
                print("[RAG] No FAISS index available")
                return []
        
        results = self._query_faiss(question, k=k, initial_k=initial_k)
        
        # Cache the results
        if results and redis and redis.is_available():
            redis.set_rag_results(question, results)
        
        return results

    async def _retrieve_context(self, inputs: dict, k: int = 3) -> dict:
        """For pipeline: takes {'question': str}, injects retrieved context."""
        query = inputs["question"]
        docs = self.query(query, k=k)
        context = "\n".join(d.page_content for d in docs)
        return {**inputs, "context": context, "uploaded_docs": self.get_docs_data()}
    
    def get_backend_status(self) -> Dict[str, Any]:
        """Get status of vector database backends."""
        status = {
            "pinecone_enabled": self.use_pinecone,
            "pinecone_available": self._pinecone_available,
            "faiss_loaded": self.vectorstore is not None,
            "faiss_path": self.save_path,
        }
        
        if self._pinecone_available and self.pinecone_service:
            try:
                stats = self.pinecone_service.get_stats()
                status["pinecone_stats"] = {
                    "total_vectors": stats.get("total_vector_count", 0),
                    "namespaces": list(stats.get("namespaces", {}).keys())
                }
            except:
                status["pinecone_stats"] = None
        
        return status


if __name__ == "__main__":
    rag = RAGPipeline()
    print(rag.get_backend_status())
