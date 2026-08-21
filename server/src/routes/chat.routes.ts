import { Router } from 'express';
import { chatWithCoach } from '../controllers/chat.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', asyncHandler(chatWithCoach));

export default router;
