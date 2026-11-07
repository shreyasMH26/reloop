import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { sendUserEvent } from '../websocket';

export const reviewsRouter = Router();

const CreateReviewSchema = z.object({
  order_id: z.string().min(1, 'Order ID is required'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, 'Review comment must be at least 3 characters').max(1000),
});

// GET REVIEWS FOR A USER (PUBLIC)
reviewsRouter.get('/user/:userId', async (req, res: Response) => {
  try {
    const reviews = await db.reviews.listByReviewee(req.params.userId);
    return res.json({ reviews });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
  }
});

// CREATE REVIEW (AUTH REQUIRED)
reviewsRouter.post('/', requireAuth, validateBody(CreateReviewSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { order_id, rating, comment } = req.body;
    const reviewerId = req.user!.id;

    // Verify order exists and is completed
    const orders = await db.orders.listByUser(reviewerId);
    const order = orders.find((o) => o.id === order_id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found in your completed transactions.' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'You can only review completed transactions.' });
    }

    const revieweeId = order.buyer_id === reviewerId ? order.seller_id : order.buyer_id;

    const review = await db.reviews.create({
      order_id,
      reviewer_id: reviewerId,
      rating,
      comment,
    });

    // Send real-time event to reviewee
    sendUserEvent(revieweeId, {
      type: 'review_received',
      payload: {
        order_id,
        rating,
        comment,
      },
    });

    return res.status(201).json({
      message: 'Review submitted successfully. Thank you for building community trust!',
      review,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to submit review' });
  }
});
