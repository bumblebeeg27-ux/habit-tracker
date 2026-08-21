import { Router } from 'express';
import { generateWorkoutPlan } from '../controllers/plan.controller.js';
import { generateDietPlan } from '../controllers/dietPlan.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/workout', asyncHandler(generateWorkoutPlan));
router.post('/diet', asyncHandler(generateDietPlan));

export default router;
