"""
POST /ask
RAG-powered Q&A. Rate limited to 10 req/min per IP.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Any, Dict, List

from app.core.limiter import limiter
from app.core.session import get_session
from app.ml.rag import query_rag

router = APIRouter()


class AskRequest(BaseModel):
    session_id: str
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]


@router.post("/ask", response_model=AskResponse)
@limiter.limit("10/minute")
async def ask(request: Request, body: AskRequest):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    session_data = get_session(body.session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    result = await query_rag(body.session_id, body.question)

    return AskResponse(
        answer=result["answer"],
        sources=result.get("sources", []),
    )
