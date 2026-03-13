"""RetrieveContext Node — pgvector cosine similarity search."""

from app.database.db import get_pool
from app.database.models import AgentState
from app.services.embedding_service import generate_embedding


async def retrieve_context(state: AgentState) -> dict:
    """
    Generate an embedding for the user question, then perform
    cosine similarity search in the pgvector database.
    Applies feature-based routing per the intent / filters.

    For follow-up queries, uses the original topic from chat history
    to generate a better embedding, while applying updated filters
    (e.g. difficulty changes).
    """
    intent = state.get("intent", "cat_prep")
    filters = state.get("filters", {})
    user_question = state.get("user_question", "")
    is_followup = state.get("is_followup", False)
    chat_history = state.get("chat_history", [])

    # For follow-ups, build a richer query by combining the original topic
    # with the current request so the embedding captures the right subject
    search_query = user_question
    if is_followup and chat_history:
        # Find the first user message (original topic)
        for msg in chat_history:
            if msg.get("role") == "user":
                search_query = f"{msg['content']} {user_question}"
                break

    pool = await get_pool()

    # ── Random retrieval modes ────────────────────────────
    if filters.get("random"):
        limit = 10 if filters.get("mock_exam") else 5
        where_clauses = ["1=1"]
        params: list = []

        if filters.get("exam_type"):
            params.append(filters["exam_type"])
            where_clauses.append(f"exam_type = ${len(params)}")

        if filters.get("difficulty"):
            params.append(filters["difficulty"])
            where_clauses.append(f"difficulty = ${len(params)}")

        query = f"""
            SELECT id, question_text, subject, exam_type, module, difficulty, topics
            FROM past_questions
            WHERE {' AND '.join(where_clauses)}
            ORDER BY RANDOM()
            LIMIT {limit}
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)

        retrieved = [dict(r) for r in rows]
        for r in retrieved:
            if 'topics' in r and r['topics'] is not None:
                r['topics'] = list(r['topics'])
        print(f"[RetrieveContext] Random retrieval: {len(retrieved)} results")
        return {"retrieved_context": retrieved}

    # ── Cosine similarity search ──────────────────────────
    query_embedding = generate_embedding(search_query)
    embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

    where_clauses = ["1=1"]
    params = [embedding_str]

    if filters.get("exam_type"):
        params.append(filters["exam_type"])
        where_clauses.append(f"exam_type = ${len(params)}")

    if filters.get("difficulty"):
        params.append(filters["difficulty"])
        where_clauses.append(f"difficulty = ${len(params)}")

    where_sql = " AND ".join(where_clauses)

    # Concept Builder: order by difficulty Easy -> Medium -> Hard
    order_clause = "ORDER BY embedding <=> $1::vector"
    if intent == "concept_builder":
        order_clause = """
            ORDER BY
                CASE difficulty
                    WHEN 'Easy'   THEN 1
                    WHEN 'Medium' THEN 2
                    WHEN 'Hard'   THEN 3
                    ELSE 4
                END,
                embedding <=> $1::vector
        """

    sql = f"""
        SELECT id, question_text, subject, exam_type, module, difficulty, topics,
               1 - (embedding <=> $1::vector) AS similarity
        FROM past_questions
        WHERE {where_sql}
        {order_clause}
        LIMIT 5
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)

    retrieved = []
    for r in rows:
        row = dict(r)
        row.pop("similarity", None)
        if 'topics' in row and row['topics'] is not None:
            row['topics'] = list(row['topics'])
        retrieved.append(row)

    print(f"[RetrieveContext] {'Follow-up' if is_followup else 'Vector'} search: {len(retrieved)} results | filters={filters}")
    return {"retrieved_context": retrieved}
