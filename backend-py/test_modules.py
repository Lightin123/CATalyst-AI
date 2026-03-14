import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check():
    conn = await asyncpg.connect(os.getenv('VECTOR_DB_URL') or os.getenv('DATABASE_URL'))
    rows = await conn.fetch("SELECT module, exam_type, count(*) FROM past_questions WHERE module='Module 5' GROUP BY module, exam_type")
    print("Module 5 Data:")
    for r in rows:
        print(dict(r))
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check())
