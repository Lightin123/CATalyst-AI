import { Request, Response } from 'express';
import { catalystAgent } from '../agents/catalystAgent';
import { HumanMessage } from '@langchain/core/messages';
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

    // Call LangGraph AI Agent
    const finalState = await catalystAgent.invoke(
      { messages: [new HumanMessage(message)], intent },
      { configurable: { thread_id: activeSessionId } }
    );
    
    // Extract recent AI message
    const msgs = finalState.messages as any[];
    const lastMsg = msgs[msgs.length - 1];
    const aiContent = lastMsg?.content || 'No response generated.';

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
      intent: finalState.intent,
      sessionId: activeSessionId
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};
