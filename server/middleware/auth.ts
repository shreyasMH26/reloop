import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

export const JWT_SECRET = process.env.JWT_SECRET || 'reloop-production-jwt-secret-key-vtu-2025';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Extract JWT token from Authorization header or HTTP-only cookie
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.cookies && req.cookies.reloop_token) {
    return req.cookies.reloop_token;
  }
  return null;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await db.users.findById(payload.id);

    if (!user) {
      return res.status(401).json({ error: 'User session invalid. Please log in again.' });
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been suspended by community moderation.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    };
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await db.users.findById(payload.id);
    if (user && user.status !== 'suspended' && user.status !== 'banned') {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
      };
    }
  } catch (err) {
    // optional, ignore errors
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}
