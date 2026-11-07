import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const ordersRouter = Router();

// GET USER ORDERS & SALES
ordersRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.orders.listByUser(req.user!.id);
    const purchases = list.filter((o) => o.buyer_id === req.user!.id);
    const sales = list.filter((o) => o.seller_id === req.user!.id);

    return res.json({
      all: list,
      purchases,
      sales,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
