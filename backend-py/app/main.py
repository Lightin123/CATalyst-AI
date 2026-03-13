"""CATalyst AI — FastAPI Application Entry Point."""

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

    # Pre-load the embedding model on startup so first request is fast
    print("[STARTUP] Loading embedding model (all-MiniLM-L6-v2)...")
    from app.services.embedding_service import generate_embedding
    generate_embedding("warmup")
    print("[STARTUP] Embedding model loaded")

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────
app.include_router(chat_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CATalyst AI Backend is running", "version": "1.0.0"}
