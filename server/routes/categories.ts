import { Router, Response } from 'express';
import { db } from '../db';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (req, res: Response) => {
  try {
    const categories = await db.categories.list();
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
