import { Request, Response } from 'express';
import { dietPlanRequestSchema, dietPlanSchema, dietPlanToolSchema } from '../schemas/dietPlan.schema.js';
import { buildDietPlanPrompt, computeTargetCalories } from '../services/promptBuilder.js';
import { callGeminiTool } from '../services/gemini.service.js';

export async function generateDietPlan(req: Request, res: Response) {
  const { profile, targetCalories } = dietPlanRequestSchema.parse(req.body);
  const calorieTarget = targetCalories ?? computeTargetCalories(profile);
  const { system, userMessage } = buildDietPlanPrompt(profile, calorieTarget);

  const toolCall = () =>
    callGeminiTool({
      system,
      userMessage,
      toolName: 'submit_diet_plan',
      toolDescription: 'Submit the generated daily meal plan.',
      inputSchema: dietPlanToolSchema,
    });

  let raw = await toolCall();
  let parsed = dietPlanSchema.safeParse(raw);

  if (!parsed.success) {
    raw = await toolCall();
    parsed = dietPlanSchema.safeParse(raw);
  }

  if (!parsed.success) {
    return res.status(502).json({ error: 'Failed to generate a valid diet plan' });
  }

  res.json({ plan: parsed.data });
}
