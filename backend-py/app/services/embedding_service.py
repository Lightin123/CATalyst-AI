import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    """Lazily load the embedding model on first use."""
    global _model
    if _model is None:
        logger.info("[EMBEDDING] Loading embedding model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
        logger.info("[EMBEDDING] Model loaded successfully")
    return _model


def generate_embedding(text: str) -> list[float]:
    """Generate a 384-dimensional embedding for the given text."""
    model = _get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()
