import { z } from 'zod';
import { profileSchema } from './profile.schema.js';

export const mealSchema = z.object({
  name: z.string(), // e.g. "Breakfast"
  items: z.array(z.string()).min(1).max(10),
  approxCalories: z.number().int().min(0).max(3000),
});

export const dietPlanSchema = z.object({
  dailyCalories: z.number().int().min(800).max(6000),
  proteinG: z.number().int().min(0).max(500),
  carbsG: z.number().int().min(0).max(800),
  fatG: z.number().int().min(0).max(300),
  meals: z.array(mealSchema).min(1).max(8),
});

export const dietPlanRequestSchema = z.object({
  profile: profileSchema,
  targetCalories: z.number().int().min(800).max(6000).optional(),
});

export type DietPlan = z.infer<typeof dietPlanSchema>;
export type DietPlanRequest = z.infer<typeof dietPlanRequestSchema>;

export const dietPlanToolSchema = {
  type: 'object',
  properties: {
    dailyCalories: { type: 'integer', minimum: 800, maximum: 6000 },
    proteinG: { type: 'integer', minimum: 0, maximum: 500 },
    carbsG: { type: 'integer', minimum: 0, maximum: 800 },
    fatG: { type: 'integer', minimum: 0, maximum: 300 },
    meals: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'e.g. "Breakfast", "Lunch", "Snack"' },
          items: {
            type: 'array',
            minItems: 1,
            maxItems: 10,
            items: { type: 'string' },
          },
          approxCalories: { type: 'integer', minimum: 0, maximum: 3000 },
        },
        required: ['name', 'items', 'approxCalories'],
      },
    },
  },
  required: ['dailyCalories', 'proteinG', 'carbsG', 'fatG', 'meals'],
} as const;
