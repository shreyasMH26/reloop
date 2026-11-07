import { Router, Response } from 'express';
import { db } from '../db';

export const sustainabilityRouter = Router();

// GET OVERALL SUSTAINABILITY METRICS
sustainabilityRouter.get('/', async (req, res: Response) => {
  try {
    const metrics = await db.sustainability.getMetrics();
    return res.json(metrics);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET COMMUNITY LEADERBOARD
sustainabilityRouter.get('/leaderboard', async (req, res: Response) => {
  try {
    const leaderboard = await db.sustainability.getLeaderboard();
    return res.json({ leaderboard });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET CATEGORY BREAKDOWN
sustainabilityRouter.get('/categories', async (req, res: Response) => {
  try {
    const categories = await db.sustainability.getCategoryBreakdown();
    return res.json({ categories });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
