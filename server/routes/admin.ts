import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

export const adminRouter = Router();

// Apply auth + admin guard to all routes in this router
adminRouter.use(requireAuth, requireAdmin);

// 1. METRICS OVERVIEW
adminRouter.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await db.moderation.getAdminMetrics();
    return res.json({ metrics });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch admin metrics' });
  }
});

// 2. USERS MANAGEMENT
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await db.users.listAll();
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list users' });
  }
});

const UserStatusSchema = z.object({
  is_suspended: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  reason: z.string().optional(),
});

adminRouter.patch('/users/:id/status', validateBody(UserStatusSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_suspended, is_verified, role, reason } = req.body;

    const updates: any = {};
    if (is_suspended !== undefined) updates.is_suspended = is_suspended;
    if (is_verified !== undefined) updates.is_verified = is_verified;
    if (role !== undefined) updates.role = role;

    const updated = await db.users.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log admin moderation action
    await db.moderation.addLog(
      req.user!.id,
      is_suspended ? 'suspend_user' : 'update_user',
      'user',
      id,
      reason || `Updated user state: ${JSON.stringify(updates)}`
    );

    return res.json({ message: 'User updated successfully', user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update user' });
  }
});

// 3. LISTINGS MANAGEMENT
adminRouter.get('/listings', async (req: AuthRequest, res: Response) => {
  try {
    // List all products including draft, flagged, archived, etc.
    const listings = await db.products.list({ status: undefined, limit: 100 });
    return res.json({ listings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list products' });
  }
});

const ListingStatusSchema = z.object({
  status: z.enum(['active', 'draft', 'reserved', 'sold', 'rented', 'exchanged', 'flagged', 'archived', 'deleted']),
  reason: z.string().optional(),
});

adminRouter.patch('/listings/:id/status', validateBody(ListingStatusSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const updated = await db.products.update(id, { status });
    if (!updated) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await db.moderation.addLog(
      req.user!.id,
      `listing_${status}`,
      'product',
      id,
      reason || `Moderator changed listing status to ${status}`
    );

    return res.json({ message: `Listing marked as ${status}`, listing: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update listing' });
  }
});

// 4. REPORTS QUEUE
adminRouter.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all';
    const reports = await db.reports.listAll(status);
    return res.json({ reports });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list reports' });
  }
});

const ReportActionSchema = z.object({
  status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']),
  moderator_notes: z.string().optional(),
  action_taken: z.string().optional(),
});

adminRouter.patch('/reports/:id/action', validateBody(ReportActionSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, moderator_notes, action_taken } = req.body;

    const report = await db.reports.updateStatus(
      id,
      status,
      moderator_notes || action_taken,
      req.user!.id
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({ message: `Report marked as ${status}`, report });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to action report' });
  }
});

// 5. AUDIT LOGS
adminRouter.get('/logs', async (req: AuthRequest, res: Response) => {
  try {
    const logs = await db.moderation.listLogs();
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch moderation logs' });
  }
});
