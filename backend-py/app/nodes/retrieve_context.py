"""RetrieveContext Node — pgvector cosine similarity search."""

from app.database.db import get_pool
from app.database.models import AgentState
from app.services.embedding_service import generate_embedding


async def retrieve_context(state: AgentState) -> dict:
    """
    Generate an embedding for the user question, then perform
    cosine similarity search in the pgvector database.
    Applies feature-based routing per the intent / filters.
    """
    intent = state.get("intent", "cat_prep")
    filters = state.get("filters", {})
    user_question = state.get("user_question", "")

    pool = await get_pool()

    # ── Random retrieval modes ────────────────────────────
    if filters.get("random"):
        limit = 5
        if filters.get("exam_type") == "FAT" or (filters.get("mock_exam") and filters.get("exam_type") != "CAT"):
            limit = 10
        type_clause = ""
        params: list = []

        if filters.get("exam_type"):
            params.append(filters["exam_type"])
            type_clause = f"AND exam_type = ${len(params)}"

        query = f"""
            SELECT id, question_text, subject, exam_type, module, difficulty, topics
            FROM past_questions
            WHERE 1=1 {type_clause}
            ORDER BY RANDOM()
            LIMIT {limit}
        """
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)

        retrieved = [dict(r) for r in rows]
        # Convert non-serializable types
        for r in retrieved:
            if 'topics' in r and r['topics'] is not None:
                r['topics'] = list(r['topics'])
        print(f"[RetrieveContext] Random retrieval: {len(retrieved)} results")
        return {"retrieved_context": retrieved}

    # ── Cosine similarity search ──────────────────────────
    query_embedding = generate_embedding(user_question)
    embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

    type_clause = ""
    params = [embedding_str]

    if filters.get("exam_type"):
        params.append(filters["exam_type"])
        type_clause += f" AND exam_type = ${len(params)}"

    if filters.get("module"):
        params.append(filters["module"])
        type_clause += f" AND module = ${len(params)}"

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
        WHERE 1=1 {type_clause}
        {order_clause}
        LIMIT 20
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)

    import random
    rows_list = list(rows)
    
    # Determine sample size based on intent and filters
    desired_length = 5
    if intent == "fat_prep" or filters.get("exam_type") == "FAT":
        desired_length = 10
        
    if len(rows_list) > desired_length:
        sampled_rows = random.sample(rows_list, desired_length)
    else:
        sampled_rows = rows_list

    retrieved = []
    for r in sampled_rows:
        row = dict(r)
        row.pop("similarity", None)
        if 'topics' in row and row['topics'] is not None:
            row['topics'] = list(row['topics'])
        retrieved.append(row)

    print(f"[RetrieveContext] Vector search: {len(retrieved)} results (sampled from {len(rows_list)})")
    return {"retrieved_context": retrieved}
