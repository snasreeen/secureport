import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { scanRateLimiter } from '../middleware/rateLimiter.js';
import { startScan } from '../controllers/scanController.js';

const router = express.Router();

// Authenticated, rate-limited scan endpoint
router.post('/', requireAuth, scanRateLimiter, startScan);

export default router;

