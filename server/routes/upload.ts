import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimit';
import { isCloudinaryLive, uploadImage, validateImageSignature } from '../lib/cloudinary';

export const uploadRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads');

// Ensure public/uploads exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * POST /api/upload
 * Supports direct base64 data-URL or binary uploads.
 * Uses binary magic-number signature validation (JPEG, PNG, WebP) and 5MB limit.
 * Uploads to Cloudinary if configured; otherwise stores in public/uploads.
 */
uploadRouter.post('/', requireAuth, uploadLimiter, async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Check data URL format: data:image/png;base64,...
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's already an external HTTP URL, just return it
      if (typeof data === 'string' && (data.startsWith('http://') || data.startsWith('https://'))) {
        return res.json({ url: data, thumbnail_url: data });
      }
      return res.status(400).json({ error: 'Invalid image format. Expected valid Base64 data URL.' });
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds maximum 5MB limit.' });
    }

    // Binary magic byte validation
    const { valid, ext } = validateImageSignature(buffer);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid file signature. Only authentic JPG, PNG, and WebP images are permitted.' });
    }

    if (isCloudinaryLive) {
      try {
        const cloudResult = await uploadImage(buffer);
        return res.status(201).json({
          url: cloudResult.url,
          thumbnail_url: cloudResult.thumbnail_url,
          public_id: cloudResult.public_id,
          size: cloudResult.bytes,
          storage: 'cloudinary',
        });
      } catch (err: any) {
        console.warn('Cloudinary upload failed, falling back to local storage:', err.message);
      }
    }

    // Local storage fallback
    const safeName = `reloop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    return res.status(201).json({
      url: publicUrl,
      thumbnail_url: publicUrl,
      size: buffer.length,
      storage: 'local',
      mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});
