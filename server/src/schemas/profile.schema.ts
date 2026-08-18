import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().max(60).nullable().optional(),
  sex: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string(),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  goal: z.enum(['fat_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness']),
  targetWeightKg: z.number().positive().nullable().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionDurationMin: z.number().int().min(10).max(180),
  equipmentAccess: z.enum(['full_gym', 'home_dumbbells', 'bodyweight_only', 'bands']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']),
  injuries: z.string().max(500).nullable().optional(),
  dietaryPreference: z.enum(['none', 'vegetarian', 'vegan', 'pescatarian', 'other']),
  allergies: z.string().max(500).nullable().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
