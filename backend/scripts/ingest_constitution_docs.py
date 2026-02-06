"""
Ingestion Script - Process and upload constitution documents to Pinecone.
Run this script to populate the vector database with legal documents.

Usage:
    python -m scripts.ingest_constitution_docs
"""
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Load environment variables from backend/.env
from dotenv import load_dotenv
load_dotenv(project_root / ".env")

from core.services.pinecone_service import get_pinecone_service, NAMESPACES
from core.services.document_processor import get_document_processor


def ingest_documents(docs_directory: str, clear_existing: bool = False):
    """
    Process all documents in directory and upsert to Pinecone.
    
    Args:
        docs_directory: Path to directory containing PDF documents
        clear_existing: If True, delete existing data in namespaces before upserting
    """
    print("=" * 60)
    print("CONSTITUTION DOCUMENTS INGESTION")
    print("=" * 60)
    
    # Initialize services
    print("\n[1/4] Initializing services...")
    pinecone_service = get_pinecone_service()
    doc_processor = get_document_processor()
    
    # Show initial stats
    print("\n[2/4] Current index statistics:")
    stats = pinecone_service.get_stats()
    print(f"  Total vectors: {stats.get('total_vector_count', 0)}")
    for ns, ns_stats in stats.get('namespaces', {}).items():
        print(f"  - {ns}: {ns_stats.get('vector_count', 0)} vectors")
    
    # Optionally clear existing data
    if clear_existing:
        print("\n[2.5/4] Clearing existing namespaces...")
        for namespace in NAMESPACES.values():
            pinecone_service.delete_namespace(namespace)
        print("  Done clearing namespaces.")
    
    # Process documents
    print(f"\n[3/4] Processing documents from: {docs_directory}")
    chunks_by_namespace = doc_processor.process_directory(docs_directory)
    
    total_chunks = sum(len(chunks) for chunks in chunks_by_namespace.values())
    print(f"\n  Total chunks created: {total_chunks}")
    for namespace, chunks in chunks_by_namespace.items():
        print(f"  - {namespace}: {len(chunks)} chunks")
    
    # Upsert to Pinecone
    print("\n[4/4] Upserting to Pinecone...")
    total_upserted = 0
    
    for namespace, chunks in chunks_by_namespace.items():
        print(f"\n  Processing namespace: {namespace}")
        records = doc_processor.chunks_to_pinecone_records(chunks)
        
        result = pinecone_service.upsert_records(records, namespace=namespace)
        upserted = result.get("upserted_count", 0)
        total_upserted += upserted
        print(f"  Upserted {upserted} records to '{namespace}'")
    
    # Final stats
    print("\n" + "=" * 60)
    print("INGESTION COMPLETE")
    print("=" * 60)
    print(f"Total records upserted: {total_upserted}")
    
    # Show updated stats
    print("\nUpdated index statistics:")
    stats = pinecone_service.get_stats()
    print(f"  Total vectors: {stats.get('total_vector_count', 0)}")
    for ns, ns_stats in stats.get('namespaces', {}).items():
        print(f"  - {ns}: {ns_stats.get('vector_count', 0)} vectors")


def main():
    """Main entry point."""
    # Default docs directory (backend/../constitution_docs)
    default_docs_dir = project_root.parent / "constitution_docs"
    
    # Check if --clear flag is passed
    clear_existing = "--clear" in sys.argv
    
    # Get path from arguments (exclude flags starting with --)
    path_args = [arg for arg in sys.argv[1:] if not arg.startswith("--")]
    
    if path_args:
        docs_dir = path_args[0]
    else:
        docs_dir = str(default_docs_dir)
    
    if not Path(docs_dir).exists():
        print(f"Error: Documents directory not found: {docs_dir}")
        sys.exit(1)
    
    ingest_documents(docs_dir, clear_existing=clear_existing)


if __name__ == "__main__":
    main()
