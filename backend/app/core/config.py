# Environment variables, settings

from pydantic_settings import BaseSettings #type: ignore
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ApnaSewa"
    DEBUG: bool = True
    SECRET_KEY: str

    # Database
    DATABASE_URL: str

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # CORS - Next.js frontend & admin
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",  # frontend
        "http://localhost:3001",  # admin dashboard
    ]

    class Config:
        env_file = ".env"


settings = Settings()
