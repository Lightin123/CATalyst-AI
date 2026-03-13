import { Request, Response } from 'express';
import prisma from '../database/prismaClient';

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, intent, sessionId } = req.body;
    
    // User ID is populated by the auth middleware
    const userId = (req as any).user?.id || 'demo-user-session';
    
    // Create or retrieve session if sessionId is provided
    let activeSessionId = sessionId;
    if (!activeSessionId) {
       // Demo fallback for standalone testing if needed
       // First, ensure the demo user exists to satisfy foreign key constraint
       const demoUser = await prisma.user.upsert({
         where: { id: userId },
         update: {},
         create: { id: userId, email: 'demo@catalyst.ai', role: 'demo' }
       });
       
       const session = await prisma.chatSession.create({
         data: { user_id: demoUser.id, intent }
       });
       activeSessionId = session.id;
    }

    // Save user message to database
    await prisma.message.create({
      data: {
        session_id: activeSessionId,
        role: 'user',
        content: message
      }
    });

    // Forward request to FastAPI Python backend
    const fastApiUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${fastApiUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, intent })
    });

    if (!response.ok) {
      throw new Error(`FastAPI returned ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiContent = data.answer || 'No response generated.';

    // Save AI message to database
    await prisma.message.create({
      data: {
        session_id: activeSessionId,
        role: 'ai',
        content: aiContent
      }
    });
    
    res.json({
      reply: aiContent,
      intent: intent,
      sessionId: activeSessionId
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};
