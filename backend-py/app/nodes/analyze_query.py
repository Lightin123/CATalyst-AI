"""AnalyzeQuery Node — Intent detection, follow-up detection, and filter extraction."""

from app.database.models import AgentState


# ── Follow-up detection patterns ────────────────────────────
_FOLLOWUP_PHRASES = [
    "easier", "simpler", "easy", "simple",
    "harder", "difficult", "tough", "challenging",
    "more", "another", "again", "similar",
    "explain again", "give me more", "show more",
    "next", "previous", "different",
]

# Maps follow-up phrases to difficulty adjustments
_DIFFICULTY_MAP = {
    "easier": "Easy",
    "simpler": "Easy",
    "easy": "Easy",
    "simple": "Easy",
    "harder": "Hard",
    "difficult": "Hard",
    "tough": "Hard",
    "challenging": "Hard",
}


def _detect_followup(user_question: str, chat_history: list[dict]) -> bool:
    """Check if the current query is a follow-up based on chat history and phrasing."""
    if not chat_history:
        return False
    q_lower = user_question.lower().strip()
    return any(phrase in q_lower for phrase in _FOLLOWUP_PHRASES)


def _extract_difficulty_change(user_question: str) -> str | None:
    """Extract a difficulty change from the user's follow-up message."""
    q_lower = user_question.lower().strip()
    for phrase, difficulty in _DIFFICULTY_MAP.items():
        if phrase in q_lower:
            return difficulty
    return None


async def analyze_query(state: AgentState) -> dict:
    """
    Detect the user intent and extract metadata filters.
    If the query is a follow-up, reuse previous filters and only
    update the specific parameter that changed (e.g. difficulty).
    """
    intent = state.get("intent", "cat_prep")
    user_question = state.get("user_question", "")
    chat_history = state.get("chat_history", [])
    previous_filters = state.get("filters", {})

    is_followup = _detect_followup(user_question, chat_history)

    if is_followup and previous_filters:
        # ── Follow-up: reuse previous filters, update only what changed ──
        filters = dict(previous_filters)

        difficulty_change = _extract_difficulty_change(user_question)
        if difficulty_change:
            filters["difficulty"] = difficulty_change

        # "more" / "another" → keep same filters, retrieval will fetch new results
        print(f"[AnalyzeQuery] FOLLOW-UP detected | intent={intent}, filters={filters}")
        return {"intent": intent, "filters": filters, "is_followup": True}

    # ── Fresh query: build default filters based on intent ───
    filters: dict = {}

    if intent == "cat_prep":
        filters = {"exam_type": "CAT"}
    elif intent == "fat_prep":
        filters = {"exam_type": "FAT"}
    elif intent == "concept_builder":
        filters = {}
    elif intent == "rapid_fire":
        filters = {"random": True}
    elif intent == "predict_exam":
        filters = {"random": True, "mock_exam": True}

    print(f"[AnalyzeQuery] intent={intent}, filters={filters}")
    return {"intent": intent, "filters": filters, "is_followup": False}
