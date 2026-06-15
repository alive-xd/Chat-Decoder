"""
Embeddings using sentence-transformers all-MiniLM-L6-v2.
Loaded once and reused.
"""
from typing import List
from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None


def get_encoder() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed_texts(texts: List[str]) -> List[List[float]]:
    encoder = get_encoder()
    embeddings = encoder.encode(texts, convert_to_numpy=True)
    return embeddings.tolist()


def embed_query(query: str) -> List[float]:
    encoder = get_encoder()
    embedding = encoder.encode([query], convert_to_numpy=True)
    return embedding[0].tolist()
