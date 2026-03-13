"""GenerateResponse Node — Structured LLM call with system prompt + chat history + context."""

import json
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.database.models import AgentState
from app.services.llm_service import get_tutor_model


SYSTEM_PROMPT_TEMPLATE = """You are CATalyst AI, an expert university tutor helping students prepare for exams.
You use retrieved past exam questions as context to provide accurate, helpful answers.

CURRENT MODE: {intent}

MODE INSTRUCTIONS:
- CAT Prep / FAT Prep: Provide step-by-step solutions and clear explanations based on the past exam context.
- Concept Builder: Introduce concepts gradually from easy to hard, building understanding.
- Rapid Fire Quiz: Present the retrieved questions as a timed quiz format. Ask one question at a time and wait for the student's answer.
- Predict Exam: Generate a realistic mock exam paper layout using the retrieved questions.

CONVERSATIONAL RULES:
1. You MUST answer using the provided past exam context below.
2. Use the chat history to understand follow-up questions in context.
3. If the user asks for "easier" questions, they want lower difficulty on the same topic.
4. If the user asks for "harder" questions, they want higher difficulty on the same topic.
5. If the user asks for "more" questions, provide additional results on the same topic.
6. If the context is insufficient, clearly state that you do not have enough information.
7. Always be helpful, clear, and educational.
8. Format your answers in clean markdown with headings and bullet points where appropriate.

PAST EXAM CONTEXT:
{context_documents}
"""

# Maximum number of history turns to include in the LLM call
_MAX_HISTORY_TURNS = 10


async def generate_response(state: AgentState) -> dict:
    """
    Call the LLM with structured inputs:
    1. system_prompt     — tutor persona + retrieved context
    2. chat_history      — previous conversation turns for continuity
    3. user_question     — current user message
    """
    if not state.get("guardrail_passed", True):
        return {}

    intent = state.get("intent", "cat_prep")
    user_question = state.get("user_question", "")
    retrieved_context = state.get("retrieved_context", [])
    chat_history = state.get("chat_history", [])

    # ── Build system prompt with retrieved context ────────
    context_documents = json.dumps(retrieved_context, indent=2, default=str)

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        intent=intent.replace("_", " ").title(),
        context_documents=context_documents,
    )

    # ── Build message list: system + history + current ────
    messages = [SystemMessage(content=system_prompt)]

    # Append chat history (capped to avoid exceeding context window)
    recent_history = chat_history[-_MAX_HISTORY_TURNS:]
    for msg in recent_history:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role in ("ai", "assistant"):
            messages.append(AIMessage(content=content))

    # Append the current user question
    messages.append(HumanMessage(content=user_question))

    # ── Call LLM ──────────────────────────────────────────
    tutor = get_tutor_model()
    response = await tutor.ainvoke(messages)

    print(f"[GenerateResponse] Generated {len(response.content)} chars (history={len(recent_history)} msgs)")
    return {
        "messages": [{"role": "ai", "content": response.content}],
    }
