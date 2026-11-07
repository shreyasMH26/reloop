import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

export const conversationsRouter = Router();

const SendMessageSchema = z.object({
  receiver_id: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message cannot be empty'),
  product_id: z.string().optional(),
});

// GET USER CONVERSATIONS
conversationsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.conversations.listByUser(req.user!.id);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET MESSAGES IN CONVERSATION
conversationsRouter.get('/:id/messages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await db.conversations.getMessages(req.params.id);
    return res.json(messages);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// SEND MESSAGE (AUTO-FINDS OR CREATES CONVERSATION)
conversationsRouter.post('/', requireAuth, validateBody(SendMessageSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { receiver_id, content, product_id } = req.body;
    const sender_id = req.user!.id;

    if (receiver_id === sender_id) {
      return res.status(400).json({ error: 'You cannot message yourself.' });
    }

    const conv = await db.conversations.findOrCreate(sender_id, receiver_id, product_id);
    const message = await db.conversations.addMessage(conv.id, sender_id, receiver_id, content);

    return res.status(201).json({
      conversation_id: conv.id,
      message,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
