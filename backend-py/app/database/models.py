from __future__ import annotations
from pydantic import BaseModel
from typing import Any, TypedDict


# ── API Schemas ──────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    intent: str = "cat_prep"


class ChatResponse(BaseModel):
    answer: str
    context_used: list[dict[str, Any]]


# ── Database Row ─────────────────────────────────────────────

class PastQuestion(BaseModel):
    id: str
    question_text: str
    subject: str | None = None
    exam_type: str | None = None  # CAT, FAT, etc.
    module: str | None = None
    difficulty: str | None = None
    topics: list[str] | None = None
    similarity: float | None = None


# ── LangGraph Agent State ───────────────────────────────────

class AgentState(TypedDict, total=False):
    messages: list[Any]
    user_question: str
    retrieved_context: list[dict[str, Any]]
    intent: str
    filters: dict[str, Any]
    guardrail_passed: bool
