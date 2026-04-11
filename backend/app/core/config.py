# Environment variables, settings

from pydantic_settings import BaseSettings #type: ignore
from typing import List, Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Helpet"
    DEBUG: bool = True
    SECRET_KEY: str

    # Database
    DATABASE_URL: str

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # Twilio SMS (optional — omit for dev mode, OTP printed to console)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    # CORS - Next.js frontend & admin
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://192.168.1.40:3000",
        "https://ggbl1mx8-3000.inc1.devtunnels.ms",
        "https://ggbl1mx8-8000.inc1.devtunnels.ms",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
