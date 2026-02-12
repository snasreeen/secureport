import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { askEducationalQuestion } from '../controllers/aiController.js';

const router = express.Router();

router.post('/ask', requireAuth, askEducationalQuestion);

export default router;

