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
    messages = state.get("messages", [])

    # Detect interactive quiz intent
    quiz_keywords = ["interactive quiz", "start quiz", "test me", "rapid fire quiz", "give me a quiz"]
    is_interactive_quiz = any(kw in user_question.lower() for kw in quiz_keywords)

    # Build default filters and calculate dynamic temperature based on user intent
    filters: dict = {}
    dynamic_temperature = 0.7  # Default

    if intent == "cat_prep" or intent == "fat_prep":
        filters = {"exam_type": "CAT" if intent == "cat_prep" else "FAT"}
        dynamic_temperature = 0.2
    elif intent == "concept_builder":
        filters = {}  # no specific exam type filter
        dynamic_temperature = 0.8
    elif intent == "rapid_fire":
        filters = {"random": True}
        dynamic_temperature = 0.4
    elif intent == "predict_exam":
        filters = {"random": True, "mock_exam": True}
        dynamic_temperature = 0.2
        if "cat" in user_question.lower():
            filters["exam_type"] = "CAT"
        elif "fat" in user_question.lower():
            filters["exam_type"] = "FAT"
        
    if is_interactive_quiz:
        dynamic_temperature = 0.4

    follow_up_keywords = ["easier", "harder", "more", "similar", "another", "explain again"]
    is_followup = any(kw in user_question.lower() for kw in follow_up_keywords) and len(messages) > 0

    if is_followup:
        print("[AnalyzeQuery] Follow-up keyword detected.")
        if "easier" in user_question.lower():
            filters["difficulty"] = "Easy"
        elif "harder" in user_question.lower():
            filters["difficulty"] = "Hard"

    # --- Module Metadata Routing ---
    import re
    module_match = re.search(r'module\s*(\d+)', user_question, re.IGNORECASE)
    if module_match:
        module_num = module_match.group(1)
        filters["module"] = f"Module {module_num}"
        # Bypass strict CAT/FAT constraints for broad Module formulas
        filters.pop("exam_type", None)
        print(f"[AnalyzeQuery] Extracted Module filter: Module {module_num}")

    # Keyword overrides
    if "creative" in user_question.lower() or "diverse" in user_question.lower():
        dynamic_temperature = 0.8
    elif "strict" in user_question.lower() or "exact" in user_question.lower():
        dynamic_temperature = 0.0

    print(f"[AnalyzeQuery] intent={intent}, filters={filters}, is_interactive_quiz={is_interactive_quiz}, llm_temperature={dynamic_temperature}")
    return {
        "intent": intent, 
        "filters": filters, 
        "is_interactive_quiz": is_interactive_quiz, 
        "llm_temperature": dynamic_temperature
    }
