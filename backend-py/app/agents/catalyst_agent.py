"""CATalyst AI Agent — LangGraph StateGraph orchestration."""

from langgraph.graph import StateGraph, START, END

from app.database.models import AgentState
from app.nodes.analyze_query import analyze_query
from app.nodes.retrieve_context import retrieve_context
from app.nodes.guardrail_check import guardrail_check
from app.nodes.generate_response import generate_response


def _should_generate(state: AgentState) -> str:
    """Conditional edge: skip generation if guardrail blocked the request."""
    if state.get("guardrail_passed", True):
        return "generate"
    return "end"


def build_agent():
    """Build and compile the LangGraph agent."""

    graph = StateGraph(AgentState)

    # ── Add nodes ─────────────────────────────────────────
    graph.add_node("analyze_query", analyze_query)
    graph.add_node("retrieve_context", retrieve_context)
    graph.add_node("guardrail_check", guardrail_check)
    graph.add_node("generate_response", generate_response)

    # ── Define edges ──────────────────────────────────────
    graph.add_edge(START, "analyze_query")
    graph.add_edge("analyze_query", "retrieve_context")
    graph.add_edge("retrieve_context", "guardrail_check")

    # Conditional: only generate if guardrail passed
    graph.add_conditional_edges(
        "guardrail_check",
        _should_generate,
        {
            "generate": "generate_response",
            "end": END,
        },
    )
    graph.add_edge("generate_response", END)

    return graph.compile()


# Singleton compiled agent
catalyst_agent = build_agent()
