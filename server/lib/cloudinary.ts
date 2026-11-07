import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

export const isCloudinaryLive = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isCloudinaryLive) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️ [ReLoop Media] Cloudinary connected successfully.');
} else {
  console.log('📁 [ReLoop Media] Cloudinary keys not provided. Using secure local media engine with 5MB validation.');
}

/**
 * Validates actual binary magic bytes to prevent renamed malicious payloads
 */
export function validateImageSignature(buffer: Buffer): { valid: boolean; ext: string } {
  if (buffer.length < 12) return { valid: false, ext: '' };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: 'png' };
  }

  // WebP: RIFF ... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, ext: 'webp' };
  }

  return { valid: false, ext: '' };
}

/**
 * Uploads an image either to Cloudinary or returns public upload metadata
 */
export async function uploadImage(buffer: Buffer, originalName?: string): Promise<{
  url: string;
  thumbnail_url: string;
  public_id: string;
  bytes: number;
}> {
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('Image exceeds 5MB maximum file size limit');
  }

  const { valid, ext } = validateImageSignature(buffer);
  if (!valid) {
    throw new Error('Invalid image file format. Only verified JPEG, PNG, or WebP images are permitted.');
  }

  if (isCloudinaryLive) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'reloop_products',
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'webp'],
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned null'));
          }
          const thumbnail = cloudinary.url(result.public_id, {
            transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }],
          });
          resolve({
            url: result.secure_url,
            thumbnail_url: thumbnail,
            public_id: result.public_id,
            bytes: result.bytes,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local storage fallback handled in upload route
  throw new Error('Cloudinary not configured');
}

/**
 * Deletes an image from Cloudinary securely
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isCloudinaryLive) return false;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch {
    return false;
  }
}
