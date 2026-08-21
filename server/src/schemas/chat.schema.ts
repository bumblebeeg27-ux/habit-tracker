import { z } from 'zod';
import { profileSchema } from './profile.schema.js';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().max(4000),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  profile: profileSchema,
  recentHistory: z.array(chatMessageSchema).max(20).optional(),
  recentWorkoutSummary: z.string().max(2000).optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
