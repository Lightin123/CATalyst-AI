"""GenerateResponse Node — Structured LLM call with system prompt + context + user question."""

import json
from langchain_core.messages import SystemMessage, HumanMessage
from app.database.models import AgentState
from app.services.llm_service import get_tutor_model


SYSTEM_PROMPT_TEMPLATE = """You are CATalyst AI, an expert university tutor.
You help students prepare for exams using past exam questions and study material.

CURRENT MODE: {intent}

MODE INSTRUCTIONS:
- CAT Prep / FAT Prep: Provide step-by-step solutions and clear explanations based on the past exam context.
- Concept Builder: Introduce concepts gradually from easy to hard, building understanding.
- Rapid Fire Quiz: Present the retrieved questions as a timed quiz format. Ask one question at a time and wait for the student's answer.
- Predict Exam: Generate a realistic mock exam paper layout using the retrieved questions.

RULES:
1. You MUST answer using the provided past exam context below.
2. If the context is insufficient, clearly state that you do not have enough information.
3. Always be helpful, clear, and educational.
4. Format your answers in clean markdown with headings and bullet points where appropriate.

PAST EXAM CONTEXT:
{context_documents}
"""


async def generate_response(state: AgentState) -> dict:
    """
    Call the LLM with structured inputs:
    1. system_prompt  — tutor persona + context
    2. context_documents — retrieved past questions
    3. user_question  — original user message
    """
    # If guardrails blocked the request, the rejection message is already set
    if not state.get("guardrail_passed", True):
        return {}

    intent = state.get("intent", "cat_prep")
    user_question = state.get("user_question", "")
    retrieved_context = state.get("retrieved_context", [])

    # ── Prepare the three structured variables ────────────
    context_documents = json.dumps(retrieved_context, indent=2, default=str)

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        intent=intent.replace("_", " ").title(),
        context_documents=context_documents,
    )

    # ── Call LLM ──────────────────────────────────────────
    tutor = get_tutor_model()
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_question),
    ]

    response = await tutor.ainvoke(messages)

    print(f"[GenerateResponse] Generated {len(response.content)} chars")
    return {
        "messages": [{"role": "ai", "content": response.content}],
    }
