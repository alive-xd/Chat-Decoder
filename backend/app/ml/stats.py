"""
Stats engine: computes conversation metrics from parsed messages.
Returns only aggregate statistics — no raw message content.
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List


def compute_stats(messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not messages:
        return {}

    participants = list({m["sender"] for m in messages})
    total_per_participant: Dict[str, int] = defaultdict(int)
    hour_counts: Dict[int, int] = defaultdict(int)
    response_times: List[float] = []  # minutes
    initiation_counts: Dict[str, int] = defaultdict(int)

    # Sort by timestamp
    sorted_msgs = sorted(messages, key=lambda x: x["timestamp"])

    prev_msg = None
    prev_sender = None
    conversation_started = None
    CONVERSATION_GAP_HOURS = 4  # new "conversation" after 4h silence

    silence_gaps: List[float] = []  # hours

    for msg in sorted_msgs:
        sender = msg["sender"]
        ts = datetime.fromisoformat(msg["timestamp"])
        total_per_participant[sender] += 1
        hour_counts[ts.hour] += 1

        if prev_msg is not None:
            prev_ts = datetime.fromisoformat(prev_msg["timestamp"])
            gap_minutes = (ts - prev_ts).total_seconds() / 60.0
            gap_hours = gap_minutes / 60.0

            if gap_hours >= CONVERSATION_GAP_HOURS:
                # New conversation started — track initiation
                initiation_counts[sender] += 1
                silence_gaps.append(gap_hours)
            elif prev_sender != sender:
                # Response within same conversation
                response_times.append(gap_minutes)

        else:
            initiation_counts[sender] += 1

        prev_msg = msg
        prev_sender = sender

    # Most active hour
    most_active_hour = max(hour_counts, key=hour_counts.get) if hour_counts else 0

    # Average response time
    avg_response_time = (
        round(sum(response_times) / len(response_times), 1) if response_times else 0
    )

    # Longest silence gap (hours)
    longest_silence_hours = round(max(silence_gaps), 1) if silence_gaps else 0

    # Date range
    first_ts = sorted_msgs[0]["timestamp"][:10]
    last_ts = sorted_msgs[-1]["timestamp"][:10]
    total_days = max(
        1,
        (
            datetime.fromisoformat(sorted_msgs[-1]["timestamp"])
            - datetime.fromisoformat(sorted_msgs[0]["timestamp"])
        ).days,
    )

    # Initiation ratio
    total_initiations = sum(initiation_counts.values()) or 1
    initiation_ratio = {
        p: round(initiation_counts[p] / total_initiations * 100, 1)
        for p in participants
    }

    # Message balance
    total_messages = sum(total_per_participant.values()) or 1
    message_balance = {
        p: round(total_per_participant[p] / total_messages * 100, 1)
        for p in participants
    }

    return {
        "total_messages": len(messages),
        "participants": participants,
        "messages_per_participant": dict(total_per_participant),
        "message_balance_pct": message_balance,
        "avg_response_time_minutes": avg_response_time,
        "most_active_hour": most_active_hour,
        "longest_silence_hours": longest_silence_hours,
        "initiation_ratio_pct": initiation_ratio,
        "first_message_date": first_ts,
        "last_message_date": last_ts,
        "total_days": total_days,
        "messages_per_day": round(len(messages) / total_days, 1),
    }
