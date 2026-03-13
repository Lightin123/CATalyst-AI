import { Request, Response } from 'express';
import prisma from '../database/prismaClient';

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { intent } = req.query;

    if (!intent) {
      return res.status(400).json({ error: 'Intent query parameter is required' });
    }

    const sessions = await prisma.chatSession.findMany({
      where: {
        user_id: userId,
        intent: String(intent),
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        intent: true,
        created_at: true,
        messages: {
          take: 1,
          orderBy: { created_at: 'asc' }, // The first message is used to derive the "title"
          select: { content: true }
        }
      }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { intent } = req.body;

    if (!intent) {
      return res.status(400).json({ error: 'Intent is required' });
    }

    const session = await prisma.chatSession.create({
      data: {
        user_id: userId,
        intent,
      }
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;

    // Verify ownership
    const session = await prisma.chatSession.findUnique({ where: { id }});
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    // Delete related messages first due to foreign key constraints
    await prisma.message.deleteMany({
      where: { session_id: id }
    });

    await prisma.chatSession.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

export const getSessionMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;

    const session = await prisma.chatSession.findUnique({ where: { id }});
    if (!session || session.user_id !== userId) {
      return res.status(404).json({ error: 'Session not found or unauthorized' });
    }

    const messages = await prisma.message.findMany({
      where: { session_id: id },
      orderBy: { created_at: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
