"""
DELETE /session/{session_id}
Wipes all session data: RAM + ChromaDB collection.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.session import delete_session
from app.ml.rag import delete_collection

router = APIRouter()


class WipeResponse(BaseModel):
    success: bool
    message: str


@router.delete("/session/{session_id}", response_model=WipeResponse)
async def wipe_session(session_id: str):
    # Delete ChromaDB collection
    delete_collection(session_id)

    # Delete session from RAM
    deleted = delete_session(session_id)

    if not deleted:
        # Already gone — still return success (idempotent)
        return WipeResponse(success=True, message="Session already cleared")

    return WipeResponse(success=True, message="All your data has been cleared")
