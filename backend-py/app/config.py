from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    jwt_secret: str = "super_secret_jwt_key"
    database_url: str = ""
    vector_db_url: str = ""
    groq_api_key: str = ""

    # LLM tunable parameters
    llm_temperature: float = 0.7
    llm_top_p: float = 0.9
    llm_max_tokens: int = 2048

    # Server settings (Render sets PORT automatically)
    port: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
