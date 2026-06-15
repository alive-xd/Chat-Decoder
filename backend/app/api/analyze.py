"""
POST /analyze
Runs the full analysis pipeline on session messages:
- Stats
- Sentiment
- Health score (Gemini, anonymized)
- Personality profiling (Gemini, anonymized)
- Timeline detection (Gemini, anonymized)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

from app.core.session import get_session, set_session_data
from app.ml.stats import compute_stats
from app.ml.sentiment import compute_sentiment
from app.ml.health import compute_health_score
from app.ml.personality import compute_personalities
from app.ml.timeline import compute_timeline

router = APIRouter()


class AnalyzeRequest(BaseModel):
    session_id: str


class AnalyzeResponse(BaseModel):
    stats: Dict[str, Any]
    sentiment: List[Dict[str, Any]]
    health: Dict[str, Any]
    personalities: Dict[str, Any]
    timeline: List[Dict[str, Any]]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(body: AnalyzeRequest):
    session_data = get_session(body.session_id)
    if session_data is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    messages = session_data.get("messages")
    if not messages:
        raise HTTPException(status_code=400, detail="No messages in session. Upload first.")

    # Step 1: Stats (fast, local)
    stats = compute_stats(messages)

    # Step 2: Sentiment (fast, local)
    sentiment = compute_sentiment(messages)

    # Step 3: Health score (Gemini, anonymized stats only)
    try:
        health = await compute_health_score(messages, stats)
    except Exception as e:
        health = {
            "score": 0,
            "label": "Unavailable",
            "observations": [f"Analysis unavailable: {str(e)[:100]}"],
        }

    # Step 4: Personality profiling (Gemini, anonymized samples)
    try:
        personalities = await compute_personalities(messages)
    except Exception as e:
        personalities = {}

    # Step 5: Timeline (Gemini, anonymized summary)
    try:
        timeline = await compute_timeline(messages, stats)
    except Exception as e:
        timeline = []

    # Cache results in session
    set_session_data(body.session_id, "analysis", {
        "stats": stats,
        "sentiment": sentiment,
        "health": health,
        "personalities": personalities,
        "timeline": timeline,
    })

    return AnalyzeResponse(
        stats=stats,
        sentiment=sentiment,
        health=health,
        personalities=personalities,
        timeline=timeline,
    )
