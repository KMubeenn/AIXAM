"""
Pinecone Service - Wrapper for Pinecone vector database operations.
Uses local embeddings (sentence-transformers/all-MiniLM-L6-v2, 384 dims).
"""
import os
from typing import List, Dict, Any, Optional
from pinecone import Pinecone
from langchain_huggingface import HuggingFaceEmbeddings

# Configuration from environment
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_HOST = os.getenv("PINECONE_HOST")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "lawbot")

# Namespace mapping for document types
NAMESPACES = {
    "constitution": "constitution",
    "penal": "penal_code",
    "criminal_procedure": "criminal_procedure",
    "civil_procedure": "civil_procedure",
    "electronic_crimes": "electronic_crimes",
}

# Embedding model (384 dimensions)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384


class PineconeService:
    """
    Service class for Pinecone operations.
    Uses local embeddings via HuggingFace (all-MiniLM-L6-v2, 384 dims).
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        """Singleton pattern - reuse connection."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if PineconeService._initialized:
            return
            
        if not PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY environment variable not set")
        if not PINECONE_HOST:
            raise ValueError("PINECONE_HOST environment variable not set")
            
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        self.index = self.pc.Index(host=PINECONE_HOST)
        
        # Initialize local embedding model
        print(f"[PineconeService] Loading embedding model: {EMBEDDING_MODEL}")
        self.embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        
        PineconeService._initialized = True
        print(f"[PineconeService] Connected to index: {PINECONE_INDEX}")
    
    def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts using local model."""
        return self.embedding_model.embed_documents(texts)
    
    def _generate_query_embedding(self, query: str) -> List[float]:
        """Generate embedding for a single query."""
        return self.embedding_model.embed_query(query)
    
    def upsert_records(
        self, 
        records: List[Dict[str, Any]], 
        namespace: str = "__default__"
    ) -> Dict[str, Any]:
        """
        Upsert records with vectors to Pinecone.
        
        Args:
            records: List of dicts with '_id', 'text', and metadata fields
            namespace: Namespace to upsert into (for document type separation)
            
        Returns:
            Upsert response with count
        """
        if not records:
            return {"upserted_count": 0}
        
        # Batch size for embedding and upserting
        batch_size = 100
        total_upserted = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            
            # Extract texts for embedding
            texts = [r.get("text", "") for r in batch]
            
            # Generate embeddings locally
            embeddings = self._generate_embeddings(texts)
            
            # Prepare vectors for Pinecone
            vectors = []
            for j, (record, embedding) in enumerate(zip(batch, embeddings)):
                vector_id = record.get("_id", f"vec_{i+j}")
                
                # Build metadata (everything except _id and text)
                metadata = {k: v for k, v in record.items() if k not in ("_id",)}
                
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # Upsert to Pinecone
            self.index.upsert(vectors=vectors, namespace=namespace)
            total_upserted += len(batch)
            print(f"[PineconeService] Upserted batch {i//batch_size + 1}: {len(batch)} records to '{namespace}'")
        
        return {"upserted_count": total_upserted}
    
    def search(
        self,
        query: str,
        namespace: str = "__default__",
        top_k: int = 20,
        filter: Optional[Dict[str, Any]] = None,
        include_metadata: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search for similar records using local embeddings.
        
        Args:
            query: Search query text
            namespace: Namespace to search in
            top_k: Number of results to return
            filter: Metadata filter (optional)
            include_metadata: Whether to include metadata in results
            
        Returns:
            List of search results with id, score, and metadata
        """
        # Generate query embedding locally
        query_vector = self._generate_query_embedding(query)
        
        # Search the index
        results = self.index.query(
            namespace=namespace,
            vector=query_vector,
            top_k=top_k,
            filter=filter,
            include_metadata=include_metadata
        )
        
        return [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata if include_metadata else {}
            }
            for match in results.matches
        ]
    
    def search_all_namespaces(
        self,
        query: str,
        top_k_per_namespace: int = 10,
        include_metadata: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search across all document namespaces and combine results.
        
        Args:
            query: Search query text
            top_k_per_namespace: Results per namespace
            include_metadata: Whether to include metadata
            
        Returns:
            Combined results from all namespaces, sorted by score
        """
        all_results = []
        
        # Generate query embedding once
        query_vector = self._generate_query_embedding(query)
        
        for namespace in NAMESPACES.values():
            try:
                results = self.index.query(
                    namespace=namespace,
                    vector=query_vector,
                    top_k=top_k_per_namespace,
                    include_metadata=include_metadata
                )
                
                for match in results.matches:
                    all_results.append({
                        "id": match.id,
                        "score": match.score,
                        "metadata": match.metadata if include_metadata else {},
                        "namespace": namespace
                    })
            except Exception as e:
                print(f"[PineconeService] Error searching namespace '{namespace}': {e}")
                continue
        
        # Sort by score descending
        all_results.sort(key=lambda x: x["score"], reverse=True)
        return all_results
    
    def delete_namespace(self, namespace: str) -> bool:
        """Delete all records in a namespace."""
        try:
            self.index.delete(delete_all=True, namespace=namespace)
            print(f"[PineconeService] Deleted all records in namespace: {namespace}")
            return True
        except Exception as e:
            print(f"[PineconeService] Error deleting namespace '{namespace}': {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get index statistics."""
        return self.index.describe_index_stats()


# Convenience function for getting service instance
def get_pinecone_service() -> PineconeService:
    """Get or create the Pinecone service singleton."""
    return PineconeService()
