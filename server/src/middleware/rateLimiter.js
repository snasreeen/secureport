import rateLimit from 'express-rate-limit';

// Global limiter: generic abuse protection
export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Login-specific limiter
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Scan-specific limiter (max 5 scans per minute per IP)
export const scanRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Scan rate limit exceeded. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

