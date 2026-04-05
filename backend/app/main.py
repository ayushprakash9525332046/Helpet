import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine
from app.models import user, service, booking, payment, review, notification  # noqa - imports all models


# ── Startup & Shutdown ──────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.APP_NAME} backend is starting...")
    yield
    print(f"🛑 {settings.APP_NAME} backend is shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for ApnaSewa - Home Services Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix="/api/v1")

# Serve uploaded files (avatars, etc.)
_uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(_uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=_uploads_dir), name="uploads")


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
