from langchain_groq import ChatGroq
from app.config import get_settings


def get_router_model() -> ChatGroq:
    """Lightweight model for intent analysis / routing."""
    settings = get_settings()
    return ChatGroq(
        api_key=settings.groq_api_key,
        model="openai/gpt-oss-20b",
        temperature=0,
    )


def get_tutor_model(temperature: float = None) -> ChatGroq:
    """Full-power model for tutoring responses."""
    settings = get_settings()
    
    final_temp = temperature if temperature is not None else settings.llm_temperature
    
    return ChatGroq(
        api_key=settings.groq_api_key,
        model="openai/gpt-oss-120b",
        temperature=final_temp,
        max_tokens=settings.llm_max_tokens,
        model_kwargs={
            "top_p": settings.llm_top_p,
        },
    )
