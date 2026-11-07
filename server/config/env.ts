import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((v) => parseInt(v, 10)).default('4000'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters in length').default('reloop-secure-jwt-secret-key-vtu-2025'),
  DATABASE_URL: z.string().optional().or(z.literal('')),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid Environment Variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

// In production, DATABASE_URL is strictly mandatory!
if (env.NODE_ENV === 'production' && (!env.DATABASE_URL || env.DATABASE_URL.trim() === '')) {
  console.error('🚨 [ReLoop FATAL] DATABASE_URL is mandatory when running in production mode! Embedded JSON store is strictly disabled in production.');
  process.exit(1);
}
