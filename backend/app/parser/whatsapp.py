"""
WhatsApp export parser.

Android format:
  MM/DD/YYYY, HH:MM - Sender: message
  DD/MM/YYYY, HH:MM - Sender: message   (some regions)

iPhone format:
  [DD/MM/YYYY, HH:MM:SS] Sender: message
  [M/D/YY, H:MM:SS AM/PM] Sender: message

Returns list of {sender, timestamp (ISO str), message, is_media}
"""
import re
from datetime import datetime
from typing import List, Dict, Any, Optional

# ── regex patterns ──────────────────────────────────────────────────────────

# Android: "01/23/2024, 14:05 - Alice: Hey"
ANDROID_RE = re.compile(
    r"^(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s+-\s+([^:]+):\s(.*)$",
    re.MULTILINE,
)

# iPhone: "[01/23/2024, 2:05:33 PM] Alice: Hey"
IPHONE_RE = re.compile(
    r"^\[(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s+([^:]+):\s(.*)$",
    re.MULTILINE,
)

ANDROID_SYSTEM_RE = re.compile(
    r"^(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s+-\s+(.*)$"
)

IPHONE_SYSTEM_RE = re.compile(
    r"^\[(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s+(.*)$"
)

MEDIA_TOKENS = {
    "<media omitted>",
    "image omitted",
    "video omitted",
    "audio omitted",
    "document omitted",
    "gif omitted",
    "sticker omitted",
    "contact card omitted",
    "location",
}

SYSTEM_PATTERNS = [
    re.compile(r"messages and calls are end-to-end encrypted", re.I),
    re.compile(r"created group", re.I),
    re.compile(r"added .+", re.I),
    re.compile(r"left", re.I),
    re.compile(r"changed the subject", re.I),
    re.compile(r"changed this group", re.I),
    re.compile(r"security code changed", re.I),
    re.compile(r"your messages are end-to-end encrypted", re.I),
]


def _is_system_message(sender: str, text: str) -> bool:
    # System messages have no real sender (just the system description)
    for p in SYSTEM_PATTERNS:
        if p.search(text):
            return True
    return False


def _parse_date(date_str: str, time_str: str) -> Optional[str]:
    """Try multiple date formats, return ISO string or None."""
    date_str = date_str.strip()
    time_str = time_str.strip()
    combined = f"{date_str} {time_str}"

    formats = [
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M",
        "%d/%m/%y %H:%M:%S",
        "%d/%m/%y %H:%M",
        "%m/%d/%y %H:%M:%S",
        "%m/%d/%y %H:%M",
        "%d/%m/%Y %I:%M:%S %p",
        "%d/%m/%Y %I:%M %p",
        "%m/%d/%Y %I:%M:%S %p",
        "%m/%d/%Y %I:%M %p",
        "%d.%m.%Y %H:%M:%S",
        "%d.%m.%Y %H:%M",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y %H:%M",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(combined, fmt)
            return dt.isoformat()
        except ValueError:
            continue
    return None


def parse_whatsapp_export(text: str) -> List[Dict[str, Any]]:
    """Parse a WhatsApp .txt export into structured messages.
    
    Uses line-by-line iteration to correctly handle multiline messages
    (continuation lines that don't start with a timestamp).
    """
    messages: List[Dict[str, Any]] = []
    current: Optional[Dict[str, Any]] = None

    lines = text.splitlines()

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue

        # Try to match as a new message (iPhone or Android)
        m = IPHONE_RE.match(line_stripped) or ANDROID_RE.match(line_stripped)
        
        # Try to match as a system message (iPhone or Android)
        sys_m = None
        if not m:
            sys_m = IPHONE_SYSTEM_RE.match(line_stripped) or ANDROID_SYSTEM_RE.match(line_stripped)

        if m:
            # Save the previous accumulated message
            if current is not None:
                messages.append(current)
                current = None

            date_s = m.group(1)
            time_s = m.group(2)
            sender = m.group(3).strip()
            body = m.group(4).strip()

            if _is_system_message(sender, body):
                continue

            ts = _parse_date(date_s, time_s)
            if ts is None:
                continue

            is_media = any(tok in body.lower() for tok in MEDIA_TOKENS)
            current = {
                "sender": sender,
                "timestamp": ts,
                "message": body,
                "is_media": is_media,
            }
        elif sys_m:
            # It's a system message: save the previous accumulated message, and reset current
            if current is not None:
                messages.append(current)
                current = None
        else:
            # Continuation line — append to current message body
            if current is not None:
                current["message"] += "\n" + line_stripped

    # Don't forget the last message
    if current is not None:
        messages.append(current)

    return messages
