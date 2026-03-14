"""Chat route — POST /chat endpoint."""

from fastapi import APIRouter, Depends, HTTPException, Request
import jwt

from app.config import get_settings
from app.database.models import ChatRequest, ChatResponse
from app.agents.catalyst_agent import catalyst_agent

router = APIRouter()


# ── JWT Authentication Dependency ────────────────────────────

async def get_current_user(request: Request) -> dict:
    """
    Verify the JWT token from the Authorization header.
    In demo mode (no token), return a guest user.
    """
    settings = get_settings()
    auth_header = request.headers.get("Authorization", "")

    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            return {"id": payload.get("id", "unknown"), "role": payload.get("role", "student")}
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    # Demo mode fallback
    return {"id": "demo-user", "role": "demo"}


# ── Chat Endpoint ────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, user: dict = Depends(get_current_user)):
    """
    Process a chat message through the LangGraph agent pipeline:
    AnalyzeQuery → RetrieveContext → GuardrailCheck → GenerateResponse
    """
    try:
        result = await catalyst_agent.ainvoke({
            "user_question": body.message,
            "intent": body.intent,
            "messages": body.history,
            "retrieved_context": [],
            "filters": {},
            "guardrail_passed": True,
        })

        # Extract the AI response
        messages = result.get("messages", [])
        last_message = messages[-1] if messages else {"content": "No response generated."}

        answer = (
            last_message.get("content", "No response generated.")
            if isinstance(last_message, dict)
            else str(last_message)
        )

        context_used = result.get("retrieved_context", [])

        return ChatResponse(answer=answer, context_used=context_used)

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")
