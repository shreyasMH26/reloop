import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthRequest, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

export const productsRouter = Router();

const ProductCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  category_id: z.string().min(1, 'Please select a category'),
  condition: z.string().min(1, 'Please specify condition'),
  listing_type: z.enum(['sell', 'rent', 'exchange']),
  price: z.number().min(0, 'Price must be 0 or greater'),
  original_price: z.number().optional().nullable(),
  rental_price_per_day: z.number().optional().nullable(),
  min_rental_days: z.number().int().min(1).optional(),
  exchange_for: z.string().optional().nullable(),
  additional_payment: z.number().optional(),
  pickup_preference: z.string().optional(),
  area: z.string().min(2, 'Please select a neighborhood or campus area'),
  images: z.array(z.string()).min(1, 'Please provide at least one product photo'),
});

// LIST PRODUCTS WITH COMPREHENSIVE FILTERS & PAGINATION
productsRouter.get('/', async (req, res: Response) => {
  try {
    const {
      q,
      category,
      condition,
      type,
      area,
      minPrice,
      maxPrice,
      sort,
      seller_id,
      limit,
      offset,
    } = req.query;

    const filters = {
      search: q ? String(q) : undefined,
      category: category ? String(category) : undefined,
      condition: condition ? String(condition) : undefined,
      listing_type: type ? String(type) : undefined,
      area: area ? String(area) : undefined,
      min_price: minPrice ? parseFloat(String(minPrice)) : undefined,
      max_price: maxPrice ? parseFloat(String(maxPrice)) : undefined,
      sort: sort ? String(sort) : 'newest',
      seller_id: seller_id ? String(seller_id) : undefined,
      limit: limit ? parseInt(String(limit), 10) : 50,
      offset: offset ? parseInt(String(offset), 10) : 0,
    };

    const result = await db.products.list(filters);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// FEATURED PRODUCTS
productsRouter.get('/featured', async (req, res: Response) => {
  try {
    const result = await db.products.list({ limit: 6, sort: 'popular' });
    return res.json(result.items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// TRENDING PRODUCTS
productsRouter.get('/trending', async (req, res: Response) => {
  try {
    const result = await db.products.list({ limit: 8, sort: 'views' });
    return res.json(result.items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// NEARBY PRODUCTS (e.g. within specific Davanagere area)
productsRouter.get('/nearby', async (req, res: Response) => {
  try {
    const area = req.query.area ? String(req.query.area) : 'MCC B Block';
    const result = await db.products.list({ area, limit: 6 });
    return res.json(result.items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET PRODUCT DETAILS BY ID
productsRouter.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await db.products.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment views
    await db.products.incrementViews(id);

    // Check wishlist status if user is authenticated
    let is_saved = false;
    if (req.user) {
      is_saved = await db.wishlists.isSaved(req.user.id, id);
    }

    return res.json({
      ...product,
      is_saved,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE NEW PRODUCT LISTING (AUTHENTICATED)
productsRouter.post('/', requireAuth, validateBody(ProductCreateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const productData = {
      ...req.body,
      seller_id: req.user!.id,
      location: 'Davanagere, Karnataka',
    };

    const newProduct = await db.products.create(productData);
    return res.status(201).json({
      message: 'Product listed successfully',
      product: newProduct,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT LISTING (AUTHENTICATED & OWNERSHIP CHECK)
productsRouter.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.products.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ownership check
    if (existing.seller_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. You can only edit your own listings.' });
    }

    const updated = await db.products.update(id, req.body);
    return res.json({ message: 'Product updated successfully', product: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT LISTING (AUTHENTICATED & OWNERSHIP CHECK)
productsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.products.findById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ownership check
    if (existing.seller_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. You can only delete your own listings.' });
    }

    await db.products.delete(id);
    return res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
