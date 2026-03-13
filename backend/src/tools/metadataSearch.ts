import vectorPool from '../database/vectorDbClient';

export const agentMetadataRetrieve = async (filters: Record<string, any> = {}, limit: number = 5) => {
  try {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    
    if (filters.type) {
      values.push(filters.type);
      whereClause += ` AND type = $${values.length}`;
    }
    if (filters.course) {
      values.push(filters.course);
      whereClause += ` AND course = $${values.length}`;
    }

    const { rows } = await vectorPool.query(`
      SELECT id, question, answer, course, type
      FROM "ExamQuestion"
      ${whereClause}
      LIMIT ${limit}
    `, values);
    
    return rows;
  } catch (error) {
    console.error('Error during vector DB metadata retrieval:', error);
    return [];
  }
};

export const agentRandomRetrieve = async (filters: Record<string, any> = {}, limit: number = 5) => {
  try {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    
    if (filters.type) {
      values.push(filters.type);
      whereClause += ` AND type = $${values.length}`;
    }
    
    const { rows } = await vectorPool.query(`
      SELECT id, question, answer, course, type
      FROM "ExamQuestion"
      ${whereClause}
      ORDER BY RANDOM()
      LIMIT ${limit}
    `, values);
    return rows;
  } catch (error) {
     console.error('Error during vector DB random retrieval:', error);
     return [];
  }
}
