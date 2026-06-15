import time
import uuid
from typing import Any, Dict, Optional
from threading import Lock

from app.core.config import settings

_store: Dict[str, Dict[str, Any]] = {}
_lock = Lock()


def create_session() -> str:
    session_id = str(uuid.uuid4())
    with _lock:
        _store[session_id] = {
            "created_at": time.time(),
            "data": {},
        }
    return session_id


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    _cleanup_expired()
    with _lock:
        session = _store.get(session_id)
        if session is None:
            return None
        return session["data"]


def set_session_data(session_id: str, key: str, value: Any) -> bool:
    with _lock:
        if session_id not in _store:
            return False
        _store[session_id]["data"][key] = value
        return True


def delete_session(session_id: str) -> bool:
    with _lock:
        if session_id in _store:
            del _store[session_id]
            return True
        return False


def _cleanup_expired():
    ttl_seconds = settings.SESSION_TTL_MINUTES * 60
    now = time.time()
    with _lock:
        expired = [
            sid
            for sid, data in _store.items()
            if now - data["created_at"] > ttl_seconds
        ]
        for sid in expired:
            del _store[sid]
