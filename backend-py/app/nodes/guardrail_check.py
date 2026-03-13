"""GuardrailCheck Node — Topic and safety filtering."""

from app.database.models import AgentState

# Keywords that signal off-topic or harmful queries
_BLOCKED_KEYWORDS = [
    "hack", "cheat", "exploit", "bypass", "illegal",
    "weapon", "drug", "violence", "porn", "gambling",
    "stock", "crypto", "bitcoin", "forex", "recipe",
    "dating", "relationship",
]

_REJECTION_MESSAGE = (
    "Sorry, I can only answer questions related to exam preparation. "
    "Please ask a question about your course material or past exams."
)


async def guardrail_check(state: AgentState) -> dict:
    """
    Validate that the user question is academically relevant
    and does not contain harmful content.
    """
    user_question = state.get("user_question", "").lower()

    # ── Rule-based keyword check ──────────────────────────
    for keyword in _BLOCKED_KEYWORDS:
        if keyword in user_question:
            print(f"[GuardrailCheck] BLOCKED — matched keyword: '{keyword}'")
            return {
                "guardrail_passed": False,
                "messages": [{"role": "ai", "content": _REJECTION_MESSAGE}],
            }

    # ── Lightweight heuristic: very short or empty queries ──
    if len(user_question.strip()) < 3:
        print("[GuardrailCheck] BLOCKED — query too short")
        return {
            "guardrail_passed": False,
            "messages": [{"role": "ai", "content": "Please provide a more detailed question."}],
        }

    print("[GuardrailCheck] PASSED")
    return {"guardrail_passed": True}
