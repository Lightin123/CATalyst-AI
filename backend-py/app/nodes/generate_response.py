"""GenerateResponse Node — Structured LLM call with system prompt + context + user question."""

import json
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
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
1. Use retrieved exam questions as context.
2. Use chat history to understand follow-up questions.
3. If the user asks for easier questions, reduce difficulty in your explanations.
4. If the user asks for harder questions, increase difficulty in your explanations.
5. If the user asks for more questions, present additional ones from the context.
6. If the user asks for a mock paper or practice exam: format it strictly as 5 questions if CAT prep, or 10 questions if FAT prep.
7. If the context is insufficient, clearly state that you do not have enough information.
8. Always be helpful, clear, and educational.
9. Format your answers in clean markdown with headings and lists.
9. IMPORTANT: ALL math expressions, numbers, variables, equations, integrals, and fractions MUST be formatted using standard LaTeX delimiters. Use $...$ for inline math and $$...$$ for block math. Example: $f(x) = x^2$. NEVER output plain text math.
10. NEVER output or reference the "Question ID" or UUIDs from the context documents.
11. CRITICAL: NEVER provide solutions using Python, Sympy, Numpy, or any other programming language. You are a mathematics tutor. All solutions MUST be written out step-by-step using standard mathematical reasoning and LaTeX equations, exactly as a human student would write them on a university exam.
12. Ensure your topics permanently align with the COURSE SYLLABUS BOUNDARIES. Do not hallucinate external subjects.

COURSE SYLLABUS BOUNDARIES:
You are strictly assisting a student enrolled in "MAT1001: Calculus for Engineers". Never teach advanced concepts outside of this scope.
- Module 1 (Single Variable Calculus): Limits, continuity, differentiation, extrema, Rolle's/Mean Value theorem, curve area, volume of revolution, sequences and series.
- Module 2 (Multivariable Differential Calculus): Functions of multiple variables, Level curves, Partial derivatives, Jacobian, Taylor's expansion, Lagrange multiplier, Leibnitz's rule.
- Module 3 (Multivariable Integral Calculus): Double/Triple integrals, polar/spherical coordinates change, Beta and Gamma functions, Error function.
- Module 4 (Vector Calculus): Vector differentiation, Gradient, Divergence, Curl, Line/Surface/Volume integrals, Green's, Stokes', and Gauss divergence theorems.
- Module 5 (Fourier series): Euler's formulae, Dirichlet's conditions, even/odd functions, Half range series, RMS value, Parseval's identity.

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
    is_interactive_quiz = state.get("is_interactive_quiz", False)
    llm_temperature = state.get("llm_temperature", 0.7)

    # ── Prepare the three structured variables ────────────
    context_documents = json.dumps(retrieved_context, indent=2, default=str)

    import uuid

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        intent=intent.replace("_", " ").title(),
        context_documents=context_documents,
    )
    
    if is_interactive_quiz:
        system_prompt += """
        
CRITICAL REQUIREMENT: The student has requested an INTERACTIVE QUIZ.
You must generate a quiz based on the context and topic requested.
You MUST format your ENTIRE response as a structured JSON object wrapped in a ```json markdown block.
DO NOT output any conversational text before or after the JSON block.

Required JSON format:
```json
{
  "title": "Quiz Title",
  "topic": "Topic Name",
  "questions": [
    {
      "question": "Question text here (use DOUBLE backslashes for LaTeX, e.g., \\\\frac{1}{2})",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "Explanation (use DOUBLE backslashes for LaTeX, e.g., \\\\partial x)"
    }
  ]
}
```
Generate 5-10 questions. Ensure exact JSON formatting.
CRITICAL: You MUST double-escape all LaTeX backslashes inside the JSON strings (e.g., \\\\frac, \\\\partial) otherwise the JSON parser will fail!
"""

    # Inject a unique Request ID to prevent Groq API exact-match caching
    system_prompt += f"\n\n[System Runtime: {uuid.uuid4()}]"

    # ── Call LLM ──────────────────────────────────────────
    tutor = get_tutor_model(temperature=llm_temperature)

    history_msgs = []
    for m in state.get("messages", []):
        if m.get("role") == "user":
            history_msgs.append(HumanMessage(content=m.get("content", "")))
        elif m.get("role") == "ai":
            history_msgs.append(AIMessage(content=m.get("content", "")))

    messages = [SystemMessage(content=system_prompt)] + history_msgs + [HumanMessage(content=user_question)]

    response = await tutor.ainvoke(messages)

    print(f"[GenerateResponse] Generated {len(response.content)} chars")
    return {
        "messages": [{"role": "ai", "content": response.content}],
    }
