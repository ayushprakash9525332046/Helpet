# Environment variables, settings

from pydantic_settings import BaseSettings #type: ignore
from typing import List


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

    # Stripe
    STRIPE_SECRET_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
