import vectorPool from '../database/vectorDbClient';
import { generateEmbedding } from '../services/embeddingService';

export const agentHybridSearch = async (query: string, filters: Record<string, any> = {}) => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Parse filters securely into the SQL query
    let typeFilter = '';
    const values: any[] = [`[${queryEmbedding.join(',')}]`];
    
    if (filters.type) {
      values.push(filters.type);
      typeFilter = `AND type = $2`;
    }

    // Execute pgvector similarity search on Vector DB
    const result = await vectorPool.query(`
      SELECT id, question, answer, course, type, 
      1 - (embedding <=> $1::vector) as similarity
      FROM "ExamQuestion"
      WHERE 1=1 ${typeFilter}
      ORDER BY embedding <=> $1::vector
      LIMIT 5
    `, values);

    return result.rows.map((row: any) => ({
      ...row,
      embedding: undefined  // Hide raw embedding from payload
    }));
  } catch (error) {
    console.error('Error during vector DB hybrid search:', error);
    return [];
  }
};
