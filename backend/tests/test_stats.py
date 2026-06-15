"""
Unit tests for the stats engine.
Run: pytest backend/tests/test_stats.py -v
"""
import pytest
from app.ml.stats import compute_stats


SAMPLE_MESSAGES = [
    {"sender": "Alice", "timestamp": "2024-01-01T09:00:00", "message": "Hey!", "is_media": False},
    {"sender": "Bob",   "timestamp": "2024-01-01T09:05:00", "message": "Hi there", "is_media": False},
    {"sender": "Alice", "timestamp": "2024-01-01T09:10:00", "message": "How are you?", "is_media": False},
    {"sender": "Bob",   "timestamp": "2024-01-01T09:15:00", "message": "Great thanks!", "is_media": False},
    # New conversation after gap
    {"sender": "Alice", "timestamp": "2024-01-03T10:00:00", "message": "Good morning!", "is_media": False},
    {"sender": "Bob",   "timestamp": "2024-01-03T10:02:00", "message": "Morning!", "is_media": False},
]


def test_total_messages():
    stats = compute_stats(SAMPLE_MESSAGES)
    assert stats["total_messages"] == 6


def test_participants_detected():
    stats = compute_stats(SAMPLE_MESSAGES)
    assert set(stats["participants"]) == {"Alice", "Bob"}


def test_messages_per_participant():
    stats = compute_stats(SAMPLE_MESSAGES)
    assert stats["messages_per_participant"]["Alice"] == 3
    assert stats["messages_per_participant"]["Bob"] == 3


def test_balance_sums_to_100():
    stats = compute_stats(SAMPLE_MESSAGES)
    total = sum(stats["message_balance_pct"].values())
    assert abs(total - 100) < 0.1


def test_initiation_sums_to_100():
    stats = compute_stats(SAMPLE_MESSAGES)
    total = sum(stats["initiation_ratio_pct"].values())
    assert abs(total - 100) < 0.1


def test_avg_response_time_positive():
    stats = compute_stats(SAMPLE_MESSAGES)
    assert stats["avg_response_time_minutes"] >= 0


def test_date_range():
    stats = compute_stats(SAMPLE_MESSAGES)
    assert stats["first_message_date"] == "2024-01-01"
    assert stats["last_message_date"] == "2024-01-03"


def test_empty_messages():
    stats = compute_stats([])
    assert stats == {}


def test_single_participant():
    msgs = [
        {"sender": "Alice", "timestamp": "2024-01-01T09:00:00", "message": "Hello", "is_media": False},
        {"sender": "Alice", "timestamp": "2024-01-01T09:05:00", "message": "Anyone there?", "is_media": False},
    ]
    stats = compute_stats(msgs)
    assert stats["participants"] == ["Alice"]
    assert stats["message_balance_pct"]["Alice"] == 100.0
