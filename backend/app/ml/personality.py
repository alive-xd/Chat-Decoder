"""
Personality profiling per participant.
Samples 50 messages, strips sender names, sends to Gemini.
"""
import random
from typing import Any, Dict, List

from app.services.gemini import personality_from_samples


async def compute_personalities(
    messages: List[Dict[str, Any]],
) -> Dict[str, Dict[str, Any]]:
    """Returns {participant_name: personality_profile} dict."""
    participants: Dict[str, List[str]] = {}
    for msg in messages:
        if msg.get("is_media"):
            continue
        sender = msg["sender"]
        if sender not in participants:
            participants[sender] = []
        participants[sender].append(msg["message"])

    results = {}
    for sender, msgs in participants.items():
        sample = random.sample(msgs, min(50, len(msgs)))
        # Anonymize — no names in the samples sent to Gemini
        anonymized = [m[:200] for m in sample]  # truncate long messages
        profile = await personality_from_samples("Person", anonymized)
        results[sender] = profile

    return results
