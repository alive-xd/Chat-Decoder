"""
Lightweight rule-based sentiment scoring.
Groups messages into 2-week windows per participant.
No LLM calls — fast and private.
"""
import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List

# Positive / negative word lists (broad coverage)
POSITIVE_WORDS = set(
    """love like happy haha lol lmao 😂 😊 😍 ❤️ 🥰 great awesome cool
    amazing wonderful fantastic excited glad thanks thank grateful appreciate
    congrats yay good best brilliant perfect sweet nice wonderful wow"""
    .split()
)

NEGATIVE_WORDS = set(
    """sad sorry miss upset angry mad hate annoyed frustrated boring bad
    worst terrible awful horrible stressed tired exhausted cry crying 😢 😭 😠
    😤 💔 ugh ugh disappointed disappointing pathetic"""
    .split()
)


def _score_message(text: str) -> float:
    """Return a score: +1 positive, -1 negative, 0 neutral."""
    tokens = re.findall(r"\w+|[\U00010000-\U0010ffff]", text.lower())
    pos = sum(1 for t in tokens if t in POSITIVE_WORDS)
    neg = sum(1 for t in tokens if t in NEGATIVE_WORDS)
    if pos + neg == 0:
        return 0.0
    return (pos - neg) / (pos + neg)


def _two_week_bucket(ts: datetime) -> str:
    """Return a YYYY-MM-DD label for the start of the 2-week window."""
    # Day of year divided into 2-week slots
    day_of_year = ts.timetuple().tm_yday
    slot = (day_of_year - 1) // 14
    slot_start_day = slot * 14 + 1
    # Reconstruct date
    year_start = datetime(ts.year, 1, 1)
    slot_date = year_start + timedelta(days=slot_start_day - 1)
    return slot_date.strftime("%Y-%m-%d")


def compute_sentiment(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Returns [{participant, date, score}] for each 2-week window.
    score is -1 to +1 (averaged over window).
    """
    # bucket[sender][window_date] = list of scores
    buckets: Dict[str, Dict[str, List[float]]] = defaultdict(lambda: defaultdict(list))

    for msg in messages:
        if msg.get("is_media"):
            continue
        ts = datetime.fromisoformat(msg["timestamp"])
        bucket = _two_week_bucket(ts)
        score = _score_message(msg["message"])
        buckets[msg["sender"]][bucket].append(score)

    results = []
    for sender, windows in buckets.items():
        for date, scores in sorted(windows.items()):
            avg = round(sum(scores) / len(scores), 3)
            results.append({"participant": sender, "date": date, "score": avg})

    return sorted(results, key=lambda x: x["date"])
