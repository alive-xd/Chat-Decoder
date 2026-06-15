"""
POST /upload
Receives anonymized message chunks from the client-side parser,
embeds them, and stores in ChromaDB for the session.
"""
from typing import List
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.core.session import create_session, set_session_data, get_session
from app.ml.rag import store_chunks

router = APIRouter()


class MessageChunk(BaseModel):
    sender: str
    timestamp: str
    message: str
    is_media: bool = False


class UploadRequest(BaseModel):
    session_id: str | None = None
    messages: List[MessageChunk]


class UploadResponse(BaseModel):
    session_id: str
    message_count: int
    chunk_count: int
    participants: List[str]


@router.post("/upload", response_model=UploadResponse)
async def upload(body: UploadRequest, background_tasks: BackgroundTasks):
    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    # Create or reuse session
    session_id = body.session_id or create_session()

    # Build 20-message window chunks for RAG
    msgs = [m.model_dump() for m in body.messages]
    chunks = _build_chunks(msgs)

    # Store raw messages in session immediately so that /analyze can run on the full dataset
    set_session_data(session_id, "messages", msgs)

    # Generate embeddings and store in ChromaDB asynchronously
    background_tasks.add_task(store_chunks, session_id, chunks)

    participants = list({m["sender"] for m in msgs})

    return UploadResponse(
        session_id=session_id,
        message_count=len(msgs),
        chunk_count=len(chunks),
        participants=participants,
    )


def _build_chunks(messages: list, window_size: int = 20) -> List[str]:
    """Combine messages into 20-message text windows for embedding."""
    chunks = []
    for i in range(0, len(messages), window_size):
        window = messages[i : i + window_size]
        lines = []
        for m in window:
            if not m.get("is_media"):
                ts = m["timestamp"][:16]  # YYYY-MM-DDTHH:MM
                lines.append(f"[{ts}] {m['sender']}: {m['message'][:200]}")
        if lines:
            chunks.append("\n".join(lines))
    return chunks
