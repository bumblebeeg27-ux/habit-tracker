import { Request, Response } from 'express';
import {
  workoutPlanRequestSchema,
  workoutProgramSchema,
  workoutProgramToolSchema,
} from '../schemas/workoutPlan.schema.js';
import { buildWorkoutProgramPrompt } from '../services/promptBuilder.js';
import { callGeminiTool } from '../services/gemini.service.js';

export async function generateWorkoutPlan(req: Request, res: Response) {
  const { profile, priorSessionsSummary } = workoutPlanRequestSchema.parse(req.body);
  const { system, userMessage } = buildWorkoutProgramPrompt(profile, priorSessionsSummary);

  const toolCall = () =>
    callGeminiTool({
      system,
      userMessage,
      toolName: 'submit_workout_program',
      toolDescription: 'Submit the generated workout program.',
      inputSchema: workoutProgramToolSchema,
    });

  let raw = await toolCall();
  let parsed = workoutProgramSchema.safeParse(raw);

  if (!parsed.success) {
    // Structured output occasionally drifts from the schema -- one retry is
    // enough in practice since the model sees the same strict tool schema.
    raw = await toolCall();
    parsed = workoutProgramSchema.safeParse(raw);
  }

  if (!parsed.success) {
    return res.status(502).json({ error: 'Failed to generate a valid workout program' });
  }

  res.json({ program: parsed.data });
}
