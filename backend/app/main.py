# uvicorn app.main:app--reload
# ────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine
from app.models import user, service, booking, payment, review, notification, otp  # noqa - imports all models


# ── Startup & Shutdown ──────────────────────────────────────────
import asyncio
import httpx
import os

async def _keepalive():
    """Ping /health every 10 min so Render free tier never cold-starts."""
    url = os.getenv("RENDER_EXTERNAL_URL", "")
    if not url:
        return
    await asyncio.sleep(60)  # wait for server to fully start
    async with httpx.AsyncClient() as client:
        while True:
            try:
                await client.get(f"{url}/health", timeout=10)
            except Exception:
                pass
            await asyncio.sleep(600)  # 10 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.APP_NAME} backend is starting...")
    task = asyncio.create_task(_keepalive())
    yield
    task.cancel()
    print(f"🛑 {settings.APP_NAME} backend is shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Helpet - Home Services Platform",
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


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
    }


@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
async def health_check():
    return {"status": "ok"}


@app.get("/debug")
def debug():
    import os

    return {
        "DATABASE_URL_exists": bool(os.getenv("DATABASE_URL")),
        "DATABASE_URL_preview": (
            str(os.getenv("DATABASE_URL", ""))[:80]
            if os.getenv("DATABASE_URL")
            else None
        ),
        "SUPABASE_URL_exists": bool(os.getenv("SUPABASE_URL")),
        "SUPABASE_KEY_exists": bool(os.getenv("SUPABASE_KEY")),
    }
