import dotenv from 'dotenv';
dotenv.config();

// Temporary debug logging for env loading
// Remove or downgrade to proper logger in production
// eslint-disable-next-line no-console
console.log('NODE_ENV =', process.env.NODE_ENV);
// eslint-disable-next-line no-console
console.log('ALLOW_PRIVATE_SCAN =', process.env.ALLOW_PRIVATE_SCAN);

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/security.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(securityHeaders);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global rate limiter
app.use(globalRateLimiter);

// CSRF protection (cookie-based, token via header `x-csrf-token`)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
});

// CSRF token route for SPA to fetch token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to state-changing routes
app.use('/api', (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();
  return csrfProtection(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SecurePort backend running on port ${PORT}`);
});

