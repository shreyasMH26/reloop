import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

export const reportsRouter = Router();

const CreateReportSchema = z.object({
  reported_type: z.enum(['product', 'user', 'message']),
  reported_id: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(2, 'Please specify a reason'),
  details: z.string().optional(),
});

reportsRouter.post('/', optionalAuth, validateBody(CreateReportSchema), async (req: AuthRequest, res: Response) => {
  try {
    const report = await db.reports.create({
      reporter_id: req.user ? req.user.id : 'anonymous',
      ...req.body,
    });
    return res.status(201).json({
      message: 'Thank you for keeping ReLoop safe. Our moderation team has received your report.',
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
