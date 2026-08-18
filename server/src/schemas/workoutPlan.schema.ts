import { z } from 'zod';
import { profileSchema } from './profile.schema.js';

export const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number().int().min(1).max(10),
  reps: z.string(), // e.g. "8-12" or "30 sec" -- kept as text to allow time-based work
  restSec: z.number().int().min(0).max(600),
  notes: z.string().optional(),
});

export const workoutDaySchema = z.object({
  dayIndex: z.number().int().min(1),
  focus: z.string(),
  exercises: z.array(exerciseSchema).min(1).max(12),
});

export const workoutProgramSchema = z.object({
  durationWeeks: z.number().int().min(1).max(16),
  daysPerWeek: z.number().int().min(1).max(7),
  days: z.array(workoutDaySchema).min(1).max(7),
});

export const workoutPlanRequestSchema = z.object({
  profile: profileSchema,
  priorSessionsSummary: z.string().max(2000).optional(),
});

export type WorkoutProgram = z.infer<typeof workoutProgramSchema>;
export type WorkoutPlanRequest = z.infer<typeof workoutPlanRequestSchema>;

export const workoutProgramToolSchema = {
  type: 'object',
  properties: {
    durationWeeks: { type: 'integer', minimum: 1, maximum: 16 },
    daysPerWeek: { type: 'integer', minimum: 1, maximum: 7 },
    days: {
      type: 'array',
      minItems: 1,
      maxItems: 7,
      items: {
        type: 'object',
        properties: {
          dayIndex: { type: 'integer', minimum: 1 },
          focus: { type: 'string' },
          exercises: {
            type: 'array',
            minItems: 1,
            maxItems: 12,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                sets: { type: 'integer', minimum: 1, maximum: 10 },
                reps: { type: 'string', description: 'e.g. "8-12" or "30 sec"' },
                restSec: { type: 'integer', minimum: 0, maximum: 600 },
                notes: { type: 'string' },
              },
              required: ['name', 'sets', 'reps', 'restSec'],
            },
          },
        },
        required: ['dayIndex', 'focus', 'exercises'],
      },
    },
  },
  required: ['durationWeeks', 'daysPerWeek', 'days'],
} as const;
