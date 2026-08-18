import { db } from '../client';
import { NewUserProfile, userProfile } from '../schema';

export type ProfileDraft = Omit<NewUserProfile, 'id' | 'createdAt' | 'updatedAt'>;

export async function createUserProfile(draft: ProfileDraft) {
  const now = new Date();
  await db.insert(userProfile).values({
    ...draft,
    createdAt: now,
    updatedAt: now,
  });
}

export async function clearUserProfile() {
  await db.delete(userProfile);
}
