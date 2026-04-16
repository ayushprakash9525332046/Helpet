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

    # Email SMTP — Gmail (optional — omit for dev mode, OTP printed to console)
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    # Cloudinary (image uploads)
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # CORS - Next.js frontend & admin
    # Add production URLs via FRONTEND_URL env var (comma-separated for multiple)
    FRONTEND_URL: Optional[str] = None

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://192.168.1.40:3000",
            "https://ggbl1mx8-3000.inc1.devtunnels.ms",
            "https://ggbl1mx8-8000.inc1.devtunnels.ms",
        ]
        if self.FRONTEND_URL:
            for url in self.FRONTEND_URL.split(","):
                url = url.strip()
                if url and url not in origins:
                    origins.append(url)
        return origins

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
