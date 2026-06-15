"""
RAG pipeline.
- Store: embed message chunks → ChromaDB in-memory collection per session
- Retrieve: embed query → top-5 chunks → Gemini answers
"""
from typing import Any, Dict, List

import chromadb

from app.ml.embeddings import embed_texts, embed_query
from app.services.gemini import rag_answer

# One ChromaDB client per process (in-memory)
_chroma_client = chromadb.Client()

# Map session_id → collection name
_SESSION_COLLECTION_PREFIX = "session_"


def _collection_name(session_id: str) -> str:
    # ChromaDB collection names must be 3-63 chars, alphanumeric + underscores/hyphens
    return f"{_SESSION_COLLECTION_PREFIX}{session_id.replace('-', '_')}"[:63]


def store_chunks(session_id: str, chunks: List[str]) -> int:
    """Embed and store message chunks in ChromaDB. Returns chunk count."""
    col_name = _collection_name(session_id)

    # Delete existing collection if present
    try:
        _chroma_client.delete_collection(col_name)
    except Exception:
        pass

    collection = _chroma_client.create_collection(col_name)

    if not chunks:
        return 0

    embeddings = embed_texts(chunks)
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    documents = chunks
    metadatas = [{"chunk_index": i} for i in range(len(chunks))]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )

    return len(chunks)


def delete_collection(session_id: str):
    """Wipe the ChromaDB collection for a session."""
    col_name = _collection_name(session_id)
    try:
        _chroma_client.delete_collection(col_name)
    except Exception:
        pass


async def query_rag(session_id: str, question: str) -> Dict[str, Any]:
    """Retrieve top-5 chunks and answer the question with Gemini."""
    col_name = _collection_name(session_id)

    try:
        collection = _chroma_client.get_collection(col_name)
    except Exception:
        return {
            "answer": "No conversation data found for this session. Please upload a chat file first.",
            "sources": [],
        }

    total_count = collection.count()
    if total_count == 0:
        return {
            "answer": "Your chat history is still being processed and indexed in the background. Please wait a few seconds and try asking again!",
            "sources": [],
        }

    query_embedding = embed_query(question)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(5, total_count),
        include=["documents", "metadatas"],
    )

    context_chunks = results["documents"][0] if results["documents"] else []

    if not context_chunks:
        return {
            "answer": "Could not find relevant context for your question.",
            "sources": [],
        }

    answer_data = await rag_answer(question, context_chunks)

    return {
        "answer": answer_data.get("answer", ""),
        "sources": [
            {"chunk_index": m.get("chunk_index"), "preview": doc[:100]}
            for m, doc in zip(
                results["metadatas"][0], results["documents"][0]
            )
        ],
    }
