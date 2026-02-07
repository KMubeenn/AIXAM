"""
Document Processor - Processes legal PDFs with structured metadata extraction.
Designed for Pakistani constitution and legal documents.
"""
import re
import os
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import hashlib

from langchain_text_splitters import RecursiveCharacterTextSplitter

try:
    from PyPDF2 import PdfReader
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False


@dataclass
class DocumentChunk:
    """Represents a processed document chunk with metadata."""
    id: str
    text: str
    document_name: str
    document_type: str
    source_file: str
    page_number: int
    chunk_index: int
    article: Optional[str] = None
    article_title: Optional[str] = None
    section: Optional[str] = None
    chapter: Optional[str] = None
    part: Optional[str] = None
    
    def to_pinecone_record(self) -> Dict[str, Any]:
        """Convert to Pinecone record format."""
        record = {
            "_id": self.id,
            "text": self.text,  # Field for integrated embedding (must match index field_map)
            "document_name": self.document_name,
            "document_type": self.document_type,
            "source_file": self.source_file,
            "page_number": self.page_number,
            "chunk_index": self.chunk_index,
        }
        
        # Add optional fields if present
        if self.article:
            record["article"] = self.article
        if self.article_title:
            record["article_title"] = self.article_title
        if self.section:
            record["section"] = self.section
        if self.chapter:
            record["chapter"] = self.chapter
        if self.part:
            record["part"] = self.part
            
        return record


# Document type configurations
DOCUMENT_CONFIGS = {
    "constitution_of_pakistan.pdf": {
        "document_name": "Constitution of Pakistan",
        "document_type": "constitution",
        "namespace": "constitution",
        "chunk_size": 800,
        "chunk_overlap": 100,
        "patterns": {
            "article": r"Article\s+(\d+[A-Z]?)",
            "part": r"PART\s+([IVXLC]+)",
            "chapter": r"Chapter\s+(\d+|[IVXLC]+)",
        }
    },
    "Pakistan Penal Code.pdf": {
        "document_name": "Pakistan Penal Code 1860",
        "document_type": "penal",
        "namespace": "penal_code",
        "chunk_size": 1000,
        "chunk_overlap": 100,
        "patterns": {
            "section": r"Section\s+(\d+[A-Z]?)",
            "chapter": r"CHAPTER\s+([IVXLC]+|[A-Z]+)",
        }
    },
    "Code_of_criminal_procedure_1898.pdf": {
        "document_name": "Code of Criminal Procedure 1898",
        "document_type": "criminal_procedure",
        "namespace": "criminal_procedure",
        "chunk_size": 1000,
        "chunk_overlap": 100,
        "patterns": {
            "section": r"Section\s+(\d+[A-Z]?)",
            "chapter": r"CHAPTER\s+([IVXLC]+)",
        }
    },
    "Code-of-Civil-Procedure-1908.pdf": {
        "document_name": "Code of Civil Procedure 1908",
        "document_type": "civil_procedure",
        "namespace": "civil_procedure",
        "chunk_size": 1000,
        "chunk_overlap": 100,
        "patterns": {
            "section": r"Section\s+(\d+[A-Z]?)",
            "order": r"ORDER\s+([IVXLC]+|\d+)",
            "rule": r"Rule\s+(\d+)",
        }
    },
    "electronic-crimes.pdf": {
        "document_name": "Prevention of Electronic Crimes Act 2016",
        "document_type": "electronic_crimes",
        "namespace": "electronic_crimes",
        "chunk_size": 800,
        "chunk_overlap": 100,
        "patterns": {
            "section": r"Section\s+(\d+[A-Z]?)",
            "chapter": r"CHAPTER\s+([IVXLC]+)",
        }
    },
}

# Default config for unknown documents
DEFAULT_CONFIG = {
    "document_name": "Legal Document",
    "document_type": "general",
    "namespace": "general",
    "chunk_size": 800,
    "chunk_overlap": 100,
    "patterns": {
        "section": r"Section\s+(\d+[A-Z]?)",
        "article": r"Article\s+(\d+[A-Z]?)",
    }
}


class DocumentProcessor:
    """
    Processes legal PDF documents with structured chunking and metadata extraction.
    """
    
    def __init__(self):
        if not PDF_AVAILABLE:
            raise ImportError("PyPDF2 is required for document processing")
    
    def _generate_chunk_id(self, doc_type: str, page: int, chunk_idx: int, text: str) -> str:
        """Generate unique chunk ID."""
        # Use hash of text content for uniqueness
        text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
        return f"{doc_type}_p{page}_c{chunk_idx}_{text_hash}"
    
    def _extract_metadata_from_text(
        self, 
        text: str, 
        patterns: Dict[str, str]
    ) -> Dict[str, Optional[str]]:
        """Extract structured metadata from text using regex patterns."""
        metadata = {}
        
        for field, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                metadata[field] = match.group(1)
            else:
                metadata[field] = None
                
        return metadata
    
    def _extract_article_title(self, text: str) -> Optional[str]:
        """Try to extract article/section title from text."""
        # Common patterns for titles after article/section numbers
        patterns = [
            r"Article\s+\d+[A-Z]?\s*[:\.\-]\s*([A-Z][^\.]+)",
            r"Section\s+\d+[A-Z]?\s*[:\.\-]\s*([A-Z][^\.]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                title = match.group(1).strip()
                # Limit title length
                return title[:100] if len(title) > 100 else title
        
        return None
    
    def _clean_text(self, text: str) -> str:
        """Clean text by normalizing whitespace and removing artifacts."""
        if not text:
            return ""
        
        # Replace multiple spaces with single space
        cleaned = re.sub(r' {2,}', ' ', text)
        
        # Replace multiple newlines with double newline
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        
        # Remove spaces around newlines
        cleaned = re.sub(r' *\n *', '\n', cleaned)
        
        # Remove leading/trailing whitespace
        cleaned = cleaned.strip()
        
        return cleaned
    
    def process_pdf(self, pdf_path: str) -> List[DocumentChunk]:
        """
        Process a PDF file and return list of chunks with metadata.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            List of DocumentChunk objects
        """
        path = Path(pdf_path)
        filename = path.name
        
        # Get document configuration
        config = DOCUMENT_CONFIGS.get(filename, DEFAULT_CONFIG)
        
        print(f"[DocumentProcessor] Processing: {filename}")
        print(f"[DocumentProcessor] Config: {config['document_name']} ({config['document_type']})")
        
        # Read PDF
        reader = PdfReader(pdf_path)
        
        # Initialize text splitter with document-specific settings
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config["chunk_size"],
            chunk_overlap=config["chunk_overlap"],
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        chunks = []
        chunk_counter = 0
        
        for page_num, page in enumerate(reader.pages, start=1):
            try:
                page_text = page.extract_text()
                if not page_text or not page_text.strip():
                    continue
                
                # Split page text into chunks
                page_chunks = text_splitter.split_text(page_text)
                
                for chunk_text in page_chunks:
                    if not chunk_text.strip():
                        continue
                    
                    # Extract metadata from chunk text
                    metadata = self._extract_metadata_from_text(
                        chunk_text, 
                        config["patterns"]
                    )
                    
                    # Try to extract title
                    title = self._extract_article_title(chunk_text)
                    
                    # Generate unique ID
                    chunk_id = self._generate_chunk_id(
                        config["document_type"],
                        page_num,
                        chunk_counter,
                        chunk_text
                    )
                    
                    chunk = DocumentChunk(
                        id=chunk_id,
                        text=self._clean_text(chunk_text),
                        document_name=config["document_name"],
                        document_type=config["document_type"],
                        source_file=filename,
                        page_number=page_num,
                        chunk_index=chunk_counter,
                        article=metadata.get("article"),
                        article_title=title,
                        section=metadata.get("section"),
                        chapter=metadata.get("chapter"),
                        part=metadata.get("part"),
                    )
                    
                    chunks.append(chunk)
                    chunk_counter += 1
                    
            except Exception as e:
                print(f"[DocumentProcessor] Error processing page {page_num}: {e}")
                continue
        
        print(f"[DocumentProcessor] Created {len(chunks)} chunks from {filename}")
        return chunks
    
    def process_directory(self, directory_path: str) -> Dict[str, List[DocumentChunk]]:
        """
        Process all PDF files in a directory.
        
        Args:
            directory_path: Path to directory containing PDFs
            
        Returns:
            Dict mapping namespace to list of chunks
        """
        directory = Path(directory_path)
        
        if not directory.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        results = {}
        
        for pdf_file in directory.glob("*.pdf"):
            chunks = self.process_pdf(str(pdf_file))
            
            if chunks:
                # Get namespace from first chunk
                namespace = DOCUMENT_CONFIGS.get(
                    pdf_file.name, 
                    DEFAULT_CONFIG
                )["namespace"]
                
                if namespace not in results:
                    results[namespace] = []
                results[namespace].extend(chunks)
        
        return results
    
    def chunks_to_pinecone_records(
        self, 
        chunks: List[DocumentChunk]
    ) -> List[Dict[str, Any]]:
        """Convert chunks to Pinecone record format."""
        return [chunk.to_pinecone_record() for chunk in chunks]


def get_document_processor() -> DocumentProcessor:
    """Get document processor instance."""
    return DocumentProcessor()
