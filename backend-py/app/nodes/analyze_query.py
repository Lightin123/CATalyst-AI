"""AnalyzeQuery Node — Intent detection and filter extraction."""

from app.database.models import AgentState


async def analyze_query(state: AgentState) -> dict:
    """
    Detect the user intent and extract metadata filters.
    The intent is provided by the frontend, so we pass it through.
    In the future this node can use the Router LLM to detect intent
    from the message content itself.
    """
    intent = state.get("intent", "cat_prep")
    user_question = state.get("user_question", "")

    # Build default filters based on intent
    filters: dict = {}

    if intent == "cat_prep":
        filters = {"exam_type": "CAT"}
    elif intent == "fat_prep":
        filters = {"exam_type": "FAT"}
    elif intent == "concept_builder":
        filters = {}  # no specific exam type filter
    elif intent == "rapid_fire":
        filters = {"random": True}
    elif intent == "predict_exam":
        filters = {"random": True, "mock_exam": True}

    print(f"[AnalyzeQuery] intent={intent}, filters={filters}")
    return {"intent": intent, "filters": filters}
