import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const vectorPool = new Pool({
  connectionString: process.env.VECTOR_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default vectorPool;
