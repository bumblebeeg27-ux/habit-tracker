import { asc } from 'drizzle-orm';
import { db } from '../client';
import { chatMessage } from '../schema';

export async function getChatHistory() {
  return db.select().from(chatMessage).orderBy(asc(chatMessage.createdAt));
}

export async function addChatMessage(role: 'user' | 'model', content: string): Promise<void> {
  await db.insert(chatMessage).values({ role, content, createdAt: new Date() });
}
