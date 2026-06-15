"""
Unit tests for the WhatsApp parser.
Run: pytest backend/tests/test_parser.py -v
"""
import pytest
from app.parser.whatsapp import parse_whatsapp_export


ANDROID_SAMPLE = """01/15/2024, 09:30 - Alice: Good morning!
01/15/2024, 09:31 - Bob: Hey! How are you?
01/15/2024, 09:32 - Alice: Doing great, thanks 😊
01/15/2024, 09:33 - Bob: <Media omitted>
01/15/2024, 09:34 - Alice: Haha nice one
01/15/2024, 10:00 - Messages and calls are end-to-end encrypted.
"""

IPHONE_SAMPLE = """[15/01/2024, 9:30:00 AM] Alice: Good morning!
[15/01/2024, 9:31:05 AM] Bob: Hey! How are you?
[15/01/2024, 9:32:10 AM] Alice: Doing great, thanks 😊
[15/01/2024, 9:33:00 AM] Bob: image omitted
[15/01/2024, 9:34:00 AM] Alice: Haha nice one
"""

MULTILINE_SAMPLE = """01/15/2024, 09:30 - Alice: This is a long message
that spans multiple lines
and continues here
01/15/2024, 09:31 - Bob: Got it!
"""


def test_android_parser_basic():
    msgs = parse_whatsapp_export(ANDROID_SAMPLE)
    # System message filtered out
    assert len(msgs) == 5
    assert msgs[0]["sender"] == "Alice"
    assert msgs[0]["message"] == "Good morning!"
    assert msgs[0]["is_media"] is False


def test_android_parser_media():
    msgs = parse_whatsapp_export(ANDROID_SAMPLE)
    media_msg = next(m for m in msgs if m["sender"] == "Bob" and m["is_media"])
    assert media_msg is not None
    assert media_msg["is_media"] is True


def test_iphone_parser_basic():
    msgs = parse_whatsapp_export(IPHONE_SAMPLE)
    assert len(msgs) == 5
    assert msgs[0]["sender"] == "Alice"
    assert msgs[1]["sender"] == "Bob"


def test_iphone_parser_media():
    msgs = parse_whatsapp_export(IPHONE_SAMPLE)
    media_msg = next(m for m in msgs if m["sender"] == "Bob" and m["is_media"])
    assert media_msg is not None


def test_timestamps_are_iso():
    msgs = parse_whatsapp_export(ANDROID_SAMPLE)
    for m in msgs:
        # Should be parseable ISO string
        from datetime import datetime
        dt = datetime.fromisoformat(m["timestamp"])
        assert dt is not None


def test_system_messages_filtered():
    msgs = parse_whatsapp_export(ANDROID_SAMPLE)
    texts = [m["message"] for m in msgs]
    assert not any("end-to-end" in t.lower() for t in texts)


def test_multiline_messages():
    msgs = parse_whatsapp_export(MULTILINE_SAMPLE)
    assert len(msgs) == 2
    assert "multiple lines" in msgs[0]["message"]
    assert "continues here" in msgs[0]["message"]


def test_empty_input():
    msgs = parse_whatsapp_export("")
    assert msgs == []


def test_participants_extracted():
    msgs = parse_whatsapp_export(ANDROID_SAMPLE)
    senders = {m["sender"] for m in msgs}
    assert "Alice" in senders
    assert "Bob" in senders
