"""
Timeline detection — detects key conversation moments.
Sends only anonymized statistical summary to Gemini.
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List

from app.services.gemini import detect_timeline_events


def _build_anonymized_summary(messages: List[Dict[str, Any]], participants: List[str]) -> str:
    """Build a statistical summary without any raw message content."""
    if not messages:
        return "Empty conversation."

    alias = {p: f"Person {chr(65 + i)}" for i, p in enumerate(participants)}
    sorted_msgs = sorted(messages, key=lambda x: x["timestamp"])

    first_date = sorted_msgs[0]["timestamp"][:10]
    last_date = sorted_msgs[-1]["timestamp"][:10]
    total = len(sorted_msgs)

    # Find long silences (>48h)
    silence_events = []
    for i in range(1, len(sorted_msgs)):
        t1 = datetime.fromisoformat(sorted_msgs[i - 1]["timestamp"])
        t2 = datetime.fromisoformat(sorted_msgs[i]["timestamp"])
        gap_hours = (t2 - t1).total_seconds() / 3600
        if gap_hours >= 48:
            silence_events.append(
                f"- Long silence of {int(gap_hours)}h ending on {sorted_msgs[i]['timestamp'][:10]}"
            )

    # Weekly message counts (for activity peaks)
    week_counts: Dict[str, int] = defaultdict(int)
    for msg in sorted_msgs:
        ts = datetime.fromisoformat(msg["timestamp"])
        week_key = (ts - timedelta(days=ts.weekday())).strftime("%Y-%m-%d")
        week_counts[week_key] += 1

    # Top 3 most active weeks
    top_weeks = sorted(week_counts.items(), key=lambda x: x[1], reverse=True)[:3]

    lines = [
        f"Conversation from {first_date} to {last_date}",
        f"Total messages: {total}",
        f"Participants: {', '.join(alias.values())}",
        "Messages per participant: " + ', '.join(
            f"{alias[p]}: {sum(1 for m in sorted_msgs if m['sender'] == p)}"
            for p in participants
        ),
        "",
        "Most active weeks (approximate message counts):",
    ]
    for week, count in top_weeks:
        lines.append(f"- Week of {week}: ~{count} messages")

    if silence_events:
        lines.append("\nNotable silence gaps:")
        lines.extend(silence_events[:5])  # cap at 5

    return "\n".join(lines)


async def compute_timeline(messages: List[Dict[str, Any]], stats: Dict[str, Any]) -> List[Dict[str, Any]]:
    participants = stats.get("participants", [])
    summary = _build_anonymized_summary(messages, participants)

    try:
        events = await detect_timeline_events(summary)
        return events
    except Exception:
        # Fallback: return basic structural events
        sorted_msgs = sorted(messages, key=lambda x: x["timestamp"])
        return [
            {
                "date": sorted_msgs[0]["timestamp"][:10],
                "event": "First message exchanged",
                "type": "first_message",
            },
            {
                "date": sorted_msgs[-1]["timestamp"][:10],
                "event": "Most recent message",
                "type": "milestone",
            },
        ]
