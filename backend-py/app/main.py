"""CATalyst AI — FastAPI Application Entry Point."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import get_pool, close_pool
from app.routes.chat_routes import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle events."""
    # ── Startup ───────────────────────────────────────────
    print("[STARTUP] Starting CATalyst AI backend...")
    pool = await get_pool()
    print(f"[STARTUP] Connected to Vector DB (pool size: {pool.get_size()})")
    print("[STARTUP] Backend ready. Embedding model will load on first request.")

    yield

    # ── Shutdown ──────────────────────────────────────────
    print("[SHUTDOWN] Shutting down...")
    await close_pool()


app = FastAPI(
    title="CATalyst AI",
    description="AI tutoring backend for university exam preparation",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
# Build allowed origins: localhost for dev + Render URLs from env
_origins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"]
_frontend_url = os.getenv("FRONTEND_URL")          # e.g. https://catalyst-ai.onrender.com
_express_url = os.getenv("EXPRESS_BACKEND_URL")     # e.g. https://catalyst-ai-api.onrender.com
if _frontend_url:
    _origins.append(_frontend_url)
if _express_url:
    _origins.append(_express_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────
app.include_router(chat_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CATalyst AI Backend is running", "version": "1.0.0"}
