import { eq } from 'drizzle-orm';
import { db } from '../client';
import {
  attendanceRecord,
  chatMessage,
  dietPlan,
  NewUserProfile,
  streakState,
  userProfile,
  workoutProgram,
  workoutSession,
  workoutSetLog,
} from '../schema';

export type ProfileDraft = Omit<NewUserProfile, 'id' | 'createdAt' | 'updatedAt'>;

export async function createUserProfile(draft: ProfileDraft) {
  const now = new Date();
  await db.insert(userProfile).values({
    ...draft,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateUserProfile(id: number, patch: Partial<ProfileDraft>) {
  await db
    .update(userProfile)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(userProfile.id, id));
}

export async function clearAllData() {
  await db.delete(chatMessage);
  await db.delete(workoutSetLog);
  await db.delete(workoutSession);
  await db.delete(workoutProgram);
  await db.delete(dietPlan);
  await db.delete(attendanceRecord);
  await db.delete(streakState);
  await db.delete(userProfile);
}
