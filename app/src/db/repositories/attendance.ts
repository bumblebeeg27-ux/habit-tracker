import { eq } from 'drizzle-orm';
import { db } from '../client';
import { attendanceRecord, streakState } from '../schema';

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayDateString(): string {
  return toLocalDateString(new Date());
}

function yesterdayDateString(fromDate: string): string {
  const [y, m, d] = fromDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return toLocalDateString(date);
}

async function getOrCreateStreakState() {
  const rows = await db.select().from(streakState);
  if (rows[0]) return rows[0];
  const [row] = await db
    .insert(streakState)
    .values({ currentStreak: 0, longestStreak: 0, lastCheckInDate: null })
    .returning();
  return row;
}

export async function hasCheckedInToday(): Promise<boolean> {
  const today = todayDateString();
  const rows = await db.select().from(attendanceRecord).where(eq(attendanceRecord.date, today));
  return rows.length > 0;
}

export async function checkIn(workoutSessionId?: number): Promise<void> {
  const today = todayDateString();
  const existing = await db.select().from(attendanceRecord).where(eq(attendanceRecord.date, today));

  if (existing[0]) {
    if (workoutSessionId && !existing[0].workoutSessionId) {
      await db
        .update(attendanceRecord)
        .set({ workoutSessionId })
        .where(eq(attendanceRecord.date, today));
    }
    return;
  }

  await db.insert(attendanceRecord).values({
    date: today,
    checkedInAt: new Date(),
    workoutSessionId,
  });

  const state = await getOrCreateStreakState();
  const wasConsecutive = state.lastCheckInDate === yesterdayDateString(today);
  const currentStreak = wasConsecutive ? state.currentStreak + 1 : 1;
  const longestStreak = Math.max(state.longestStreak, currentStreak);

  await db
    .update(streakState)
    .set({ currentStreak, longestStreak, lastCheckInDate: today })
    .where(eq(streakState.id, state.id));
}

export async function getStreakState() {
  return getOrCreateStreakState();
}
