import rateLimit from 'express-rate-limit';

// Global API rate limiter (protects against flood/DDoS)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP address, please try again in a minute.',
  },
});

// Authentication rate limiter (brute-force defense for login, register, password reset)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. For security reasons, please try again in 15 minutes.',
  },
});

// Upload rate limiter (protects against storage abuse)
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Upload limit reached. Please wait a few minutes before uploading more photos.',
  },
});
