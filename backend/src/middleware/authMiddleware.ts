import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      (req as any).user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  
  // Demo Mode: If no valid token, create a static user ID for demo purposes.
  // The temporary session ID can still be tracked.
  const sessionId = req.headers['x-demo-session-id'] || uuidv4();
  (req as any).user = { id: 'demo-user', role: 'demo', sessionId };
  
  next();
};
