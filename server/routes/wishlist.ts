import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const wishlistRouter = Router();

// GET USER'S SAVED PRODUCTS
wishlistRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const items = await db.wishlists.listByUser(req.user!.id);
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// TOGGLE SAVE PRODUCT
wishlistRouter.post('/:productId/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const result = await db.wishlists.toggle(req.user!.id, productId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
