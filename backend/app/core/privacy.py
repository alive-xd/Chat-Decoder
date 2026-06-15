from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import logging

logger = logging.getLogger("chat-decoder")


class PrivacyMiddleware(BaseHTTPMiddleware):
    """Ensure no message content is ever logged."""

    SENSITIVE_PATHS = {"/upload", "/analyze", "/ask"}

    async def dispatch(self, request: Request, call_next):
        # Only log path + method — never body content
        if request.url.path not in self.SENSITIVE_PATHS:
            logger.info(f"{request.method} {request.url.path}")
        response = await call_next(request)
        return response
