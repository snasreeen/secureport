import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getFlaggedScans, getRecentScans, getAuditLogs } from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/flagged-scans', getFlaggedScans);
router.get('/recent-scans', getRecentScans);
router.get('/audit-logs', getAuditLogs);

export default router;

