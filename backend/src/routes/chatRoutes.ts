import { Router } from 'express';
import { handleChat } from '../controllers/chatController';
import { getSessions, createSession, deleteSession, getSessionMessages } from '../controllers/sessionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Endpoint for submitting chat messages
router.post('/', authenticate, handleChat);

// Session endpoints
router.get('/sessions', authenticate, getSessions);
router.post('/sessions', authenticate, createSession);
router.delete('/sessions/:id', authenticate, deleteSession);
router.get('/sessions/:id/messages', authenticate, getSessionMessages);

export default router;
