import { Router } from 'express';
import { generateWorkoutPlan } from '../controllers/plan.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/workout', asyncHandler(generateWorkoutPlan));

export default router;
