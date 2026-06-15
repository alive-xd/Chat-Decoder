"""
Chat Decoder — FastAPI backend
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.config import settings
from app.core.limiter import limiter
from app.core.privacy import PrivacyMiddleware
from app.api import upload, analyze, ask, session

app = FastAPI(
    title="Chat Decoder API",
    description="Privacy-first WhatsApp conversation intelligence",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.CORS_ORIGIN,
        "http://localhost:3000",
        "https://chat-decoder-sable.vercel.app",
        "https://chat-decoder-sable.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Privacy middleware
app.add_middleware(PrivacyMiddleware)

# Routes
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(ask.router)
app.include_router(session.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "chat-decoder"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
