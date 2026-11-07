import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase, closeDatabase } from './db';
import { initWebSocketServer } from './websocket';
import { apiLimiter } from './middleware/rateLimit';
import { authRouter } from './routes/auth';
import { productsRouter } from './routes/products';
import { categoriesRouter } from './routes/categories';
import { wishlistRouter } from './routes/wishlist';
import { requestsRouter } from './routes/requests';
import { ordersRouter } from './routes/orders';
import { conversationsRouter } from './routes/conversations';
import { reviewsRouter } from './routes/reviews';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';
import { reportsRouter } from './routes/reports';
import { sustainabilityRouter } from './routes/sustainability';
import { uploadRouter } from './routes/upload';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite dev server and images from Unsplash / Cloudinary
    crossOriginEmbedderPolicy: false,
  })
);

// Cookie Parser for HTTP-only JWT
app.use(cookieParser());

// CORS configuration supporting credentials
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'],
    credentials: true,
  })
);

// Global API rate limiting
app.use('/api', apiLimiter);

// Body parsers with safe limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded images
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/purchase-requests', requestsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sustainability', sustainabilityRouter);
app.use('/api/upload', uploadRouter);

// Health check with uptime, memory, and database status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'ReLoop Community Marketplace API',
    version: '1.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

// Start server
async function start() {
  await initDatabase();

  // Initialize Real-time WebSocket Gateway
  initWebSocketServer(server);

  server.listen(PORT, () => {
    console.log(`🚀 [ReLoop Server] Running at http://localhost:${PORT}`);
    console.log(`📡 [ReLoop API] Health check at http://localhost:${PORT}/api/health`);
    console.log(`⚡ [ReLoop Realtime] WebSocket listening at ws://localhost:${PORT}/ws`);
  });
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 [ReLoop Server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await closeDatabase();
    console.log('✅ [ReLoop Server] Connections closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((err) => {
  console.error('Fatal error starting ReLoop server:', err);
  process.exit(1);
});
