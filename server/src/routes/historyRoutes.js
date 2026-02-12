import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyHistory, deleteMyScan, exportMyHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', requireAuth, getMyHistory);
router.delete('/:id', requireAuth, deleteMyScan);
router.get('/export/json', requireAuth, exportMyHistory);

export default router;

