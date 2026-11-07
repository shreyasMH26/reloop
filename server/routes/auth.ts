import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthRequest, JWT_SECRET } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimit';

export const authRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  full_name: z.string().min(2, 'Full name is required'),
  area: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  area: z.string().optional(),
  location: z.string().optional(),
  avatar_url: z.string().url().or(z.literal('')).optional(),
});

// REGISTER (with rate limiting)
authRouter.post('/register', authLimiter, validateBody(RegisterSchema), async (req, res: Response) => {
  try {
    const { email, password, full_name, area, phone, bio } = req.body;

    const existing = await db.users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.users.create({
      email,
      password_hash,
      full_name,
      area: area || 'MCC B Block',
      phone: phone || '',
      bio: bio || '',
      location: 'Davanagere, Karnataka',
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('reloop_token', token, COOKIE_OPTIONS);

    const { password_hash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// LOGIN (with rate limiting)
authRouter.post('/login', authLimiter, validateBody(LoginSchema), async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ error: 'Your account has been suspended by community moderation.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('reloop_token', token, COOKIE_OPTIONS);

    const { password_hash: _, ...safeUser } = user;
    return res.json({
      message: 'Logged in successfully',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// LOGOUT
authRouter.post('/logout', (req, res: Response) => {
  res.clearCookie('reloop_token', COOKIE_OPTIONS);
  return res.json({ message: 'Logged out successfully' });
});

// GET CURRENT USER (/api/auth/me)
authRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await db.users.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password_hash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE PROFILE
authRouter.put('/profile', requireAuth, validateBody(ProfileUpdateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await db.users.update(req.user!.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password_hash: _, ...safeUser } = updated;
    return res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// FORGOT PASSWORD
authRouter.post('/forgot-password', authLimiter, async (req, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await db.users.findByEmail(email);
  let devToken: string | null = null;

  if (user) {
    const token = jwt.sign({ id: user.id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '2h' });
    await db.passwordReset.createToken(user.id, token, 2);
    if (process.env.NODE_ENV !== 'production') {
      devToken = token;
    }
  }

  // Always return 200 to prevent user enumeration
  return res.json({
    message: 'If that email exists in our system, password reset instructions have been sent.',
    ...(devToken ? { devToken } : {}),
  });
});

// RESET PASSWORD
authRouter.post('/reset-password', authLimiter, async (req, res: Response) => {
  const { token, new_password } = req.body;
  if (!token || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Valid token and minimum 6 character password required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await db.users.update(decoded.id, { password_hash });

    return res.json({ message: 'Password has been successfully updated. You can now log in.' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }
});
