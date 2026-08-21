import { Request, Response } from 'express';
import { chatRequestSchema } from '../schemas/chat.schema.js';
import { buildChatContextMessage, buildChatSystemPrompt } from '../services/promptBuilder.js';
import { callGeminiText } from '../services/gemini.service.js';

export async function chatWithCoach(req: Request, res: Response) {
  const { message, profile, recentHistory, recentWorkoutSummary } = chatRequestSchema.parse(req.body);

  const system = buildChatSystemPrompt();
  const messages = [
    { role: 'user' as const, text: buildChatContextMessage(profile, recentWorkoutSummary) },
    { role: 'model' as const, text: "Got it, I've got your profile. What's up?" },
    ...(recentHistory ?? []),
    { role: 'user' as const, text: message },
  ];

  const reply = await callGeminiText({ system, messages, maxOutputTokens: 600 });
  res.json({ reply });
}
