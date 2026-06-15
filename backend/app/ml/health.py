"""
Relationship health score — sends ONLY anonymized stats to Gemini,
never raw messages.
"""
from typing import Any, Dict

from app.ml.stats import compute_stats
from app.services.gemini import health_score_from_stats


async def compute_health_score(messages: list, stats: Dict[str, Any]) -> Dict[str, Any]:
    """Build anonymized summary for Gemini and return health score."""

    # Replace real participant names with Person A, Person B, etc.
    participants = stats.get("participants", [])
    alias = {p: f"Person {chr(65 + i)}" for i, p in enumerate(participants)}

    anonymized_stats = {
        "total_messages": stats["total_messages"],
        "conversation_duration_days": stats["total_days"],
        "messages_per_day": stats["messages_per_day"],
        "avg_response_time_minutes": stats["avg_response_time_minutes"],
        "most_active_hour": stats["most_active_hour"],
        "longest_silence_hours": stats["longest_silence_hours"],
        "message_balance_pct": {
            alias.get(p, p): v
            for p, v in stats.get("message_balance_pct", {}).items()
        },
        "initiation_ratio_pct": {
            alias.get(p, p): v
            for p, v in stats.get("initiation_ratio_pct", {}).items()
        },
    }

    result = await health_score_from_stats(anonymized_stats)
    return result
