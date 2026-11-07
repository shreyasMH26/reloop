import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const notificationsRouter = Router();

// LIST NOTIFICATIONS FOR LOGGED IN USER
notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await db.notifications.listByUser(req.user!.id);
    const unreadCount = await db.notifications.getUnreadCount(req.user!.id);
    return res.json({ notifications, unread_count: unreadCount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

// GET UNREAD COUNT
notificationsRouter.get('/unread-count', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await db.notifications.getUnreadCount(req.user!.id);
    return res.json({ unread_count: unreadCount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// MARK SINGLE AS READ
notificationsRouter.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await db.notifications.markAsRead(req.params.id, req.user!.id);
    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    return res.json({ message: 'Marked as read', notification: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// MARK ALL AS READ
notificationsRouter.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await db.notifications.markAllAsRead(req.user!.id);
    return res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
