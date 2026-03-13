from langchain_groq import ChatGroq
from app.config import get_settings


def get_router_model() -> ChatGroq:
    """Lightweight model for intent analysis / routing."""
    settings = get_settings()
    return ChatGroq(
        api_key=settings.groq_api_key,
        model="llama-3.1-8b-instant",
        temperature=0,
    )


def get_tutor_model() -> ChatGroq:
    """Full-power model for tutoring responses."""
    settings = get_settings()
    return ChatGroq(
        api_key=settings.groq_api_key,
        model="llama-3.3-70b-versatile",
        temperature=settings.llm_temperature,
        max_tokens=settings.llm_max_tokens,
        model_kwargs={
            "top_p": settings.llm_top_p,
            "seed": settings.llm_seed,
        },
    )
