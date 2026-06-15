from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    SESSION_SECRET: str = "change-me-in-production"
    CORS_ORIGIN: str = "http://localhost:3000"
    SESSION_TTL_MINUTES: int = 30
    RATE_LIMIT: str = "10/minute"

    class Config:
        env_file = ".env"


settings = Settings()
