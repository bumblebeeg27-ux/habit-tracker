import { UserProfile } from '../db/schema';
import { WorkoutProgram } from '../types/workout';
import { DietPlan } from '../types/diet';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CLIENT_KEY = process.env.EXPO_PUBLIC_CLIENT_KEY;

class ApiError extends Error {}

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL || !CLIENT_KEY) {
    throw new ApiError('API is not configured (missing EXPO_PUBLIC_API_URL/EXPO_PUBLIC_CLIENT_KEY)');
  }
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-key': CLIENT_KEY,
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new ApiError(json?.error ?? `Request failed with status ${response.status}`);
  }
  return json as T;
}

function toProfilePayload(profile: UserProfile) {
  const { id, createdAt, updatedAt, ...rest } = profile;
  return rest;
}

export async function fetchWorkoutProgram(
  profile: UserProfile,
  priorSessionsSummary?: string,
): Promise<WorkoutProgram> {
  const { program } = await post<{ program: WorkoutProgram }>('/api/plan/workout', {
    profile: toProfilePayload(profile),
    priorSessionsSummary,
  });
  return program;
}

export async function fetchDietPlan(profile: UserProfile): Promise<DietPlan> {
  const { plan } = await post<{ plan: DietPlan }>('/api/plan/diet', {
    profile: toProfilePayload(profile),
  });
  return plan;
}

export async function sendChatMessage(
  profile: UserProfile,
  message: string,
  recentHistory: { role: 'user' | 'model'; text: string }[],
): Promise<string> {
  const { reply } = await post<{ reply: string }>('/api/chat', {
    profile: toProfilePayload(profile),
    message,
    recentHistory,
  });
  return reply;
}
