import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

export const requestsRouter = Router();

const CreateRequestSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  request_type: z.enum(['buy', 'rent', 'exchange']),
  offered_price: z.number().min(0).optional(),
  message: z.string().optional(),
  rental_start_date: z.string().optional().nullable(),
  rental_end_date: z.string().optional().nullable(),
  exchange_item_title: z.string().optional().nullable(),
  exchange_item_image: z.string().optional().nullable(),
  exchange_cash_diff: z.number().optional(),
});

// CREATE REQUEST (BUY / RENT / EXCHANGE)
requestsRouter.post('/', requireAuth, validateBody(CreateRequestSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, ...data } = req.body;
    const product = await db.products.findById(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id === req.user!.id) {
      return res.status(400).json({ error: 'You cannot place a request on your own listing.' });
    }

    const newRequest = await db.requests.create({
      product_id,
      buyer_id: req.user!.id,
      seller_id: product.seller_id,
      ...data,
      offered_price: data.offered_price !== undefined ? data.offered_price : product.price,
    });

    // Also initiate or update conversation message automatically
    try {
      const conv = await db.conversations.findOrCreate(req.user!.id, product.seller_id, product_id);
      const requestSummary = data.request_type === 'rent'
        ? `[Rental Request: ₹${data.offered_price || product.rental_price_per_day}/day from ${data.rental_start_date || 'TBD'} to ${data.rental_end_date || 'TBD'}] ${data.message || ''}`
        : data.request_type === 'exchange'
        ? `[Exchange Proposal for "${data.exchange_item_title || 'Item'}"] ${data.message || ''}`
        : `[Purchase Request: ₹${data.offered_price || product.price}] ${data.message || ''}`;

      await db.conversations.addMessage(conv.id, req.user!.id, product.seller_id, requestSummary);
    } catch (e) {
      // conversation message failure should not abort request creation
    }

    return res.status(201).json({
      message: 'Request submitted to seller successfully',
      request: newRequest,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// INCOMING REQUESTS FOR SELLER
requestsRouter.get('/incoming', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.requests.listIncoming(req.user!.id);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// OUTGOING REQUESTS FROM BUYER
requestsRouter.get('/outgoing', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.requests.listOutgoing(req.user!.id);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE REQUEST STATUS (ACCEPT / REJECT / COMPLETE / CANCEL)
requestsRouter.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const request = await db.requests.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check authorization: seller can accept/reject/complete; buyer can cancel
    const isSeller = request.seller_id === req.user!.id;
    const isBuyer = request.buyer_id === req.user!.id;

    if (!isSeller && !isBuyer && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to modify this request' });
    }

    if (['accepted', 'rejected', 'completed'].includes(status) && !isSeller && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Only the seller can accept, reject or complete this request.' });
    }

    const updated = await db.requests.updateStatus(id, status);
    return res.json({ message: `Request marked as ${status}`, request: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
