import { eq } from 'drizzle-orm';
import { db } from '../client';
import { attendanceRecord, streakState } from '../schema';
import { WeeklySchedule } from '../../types/workout';

export type AttendanceStatus = 'present' | 'absent';

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayDateString(): string {
  return toLocalDateString(new Date());
}

function dayBefore(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
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

function computeCurrentStreak(presentDates: Set<string>): number {
  let cursor = new Date();
  // Today not being marked yet shouldn't zero out an otherwise-active streak.
  if (!presentDates.has(toLocalDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (presentDates.has(toLocalDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeLongestStreak(sortedDates: string[]): number {
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const date of sortedDates) {
    run = prev && dayBefore(date) === prev ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = date;
  }
  return longest;
}

// Recomputed from full history rather than incremented on each check-in --
// necessary now that any past day can be marked/unmarked via the calendar,
// not just "today" in chronological order.
async function recomputeStreakState(): Promise<void> {
  const rows = await db.select().from(attendanceRecord).where(eq(attendanceRecord.status, 'present'));
  const dates = rows.map((r) => r.date).sort();
  const presentSet = new Set(dates);
  const currentStreak = computeCurrentStreak(presentSet);
  const longestStreak = Math.max(computeLongestStreak(dates), currentStreak);
  const lastCheckInDate = dates[dates.length - 1] ?? null;

  const state = await getOrCreateStreakState();
  await db
    .update(streakState)
    .set({ currentStreak, longestStreak, lastCheckInDate })
    .where(eq(streakState.id, state.id));
}

export async function hasCheckedInToday(): Promise<boolean> {
  const rows = await db.select().from(attendanceRecord).where(eq(attendanceRecord.date, todayDateString()));
  return rows[0]?.status === 'present';
}

export async function setAttendanceStatus(
  date: string,
  status: AttendanceStatus | null,
  workoutSessionId?: number,
): Promise<void> {
  const existing = await db.select().from(attendanceRecord).where(eq(attendanceRecord.date, date));

  if (status === null) {
    if (existing[0]) {
      await db.delete(attendanceRecord).where(eq(attendanceRecord.date, date));
    }
  } else if (existing[0]) {
    await db
      .update(attendanceRecord)
      .set({ status, checkedInAt: new Date(), workoutSessionId: workoutSessionId ?? existing[0].workoutSessionId })
      .where(eq(attendanceRecord.date, date));
  } else {
    await db.insert(attendanceRecord).values({ date, status, checkedInAt: new Date(), workoutSessionId });
  }

  await recomputeStreakState();
}

export async function checkIn(workoutSessionId?: number): Promise<void> {
  await setAttendanceStatus(todayDateString(), 'present', workoutSessionId);
}

export async function getStreakState() {
  return getOrCreateStreakState();
}

// A scheduled day that passes with no check-in defaults to "absent" rather
// than staying blank, so streaks/history reflect misses without requiring
// the user to explicitly mark them -- they can still edit it to "present"
// later from the attendance calendar, which corrects history normally.
// Only ever touches past days (never today, which may still be checked
// into later) and only scheduled workout days (never rest days).
export async function backfillMissedAttendance(
  schedule: WeeklySchedule,
  programStartedAt: Date,
): Promise<void> {
  const existing = await db.select({ date: attendanceRecord.date }).from(attendanceRecord);
  const existingDates = new Set(existing.map((r) => r.date));

  const cursor = new Date(programStartedAt.getFullYear(), programStartedAt.getMonth(), programStartedAt.getDate());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const toInsert: { date: string; status: 'absent'; checkedInAt: Date }[] = [];
  while (cursor <= yesterday) {
    const dateStr = toLocalDateString(cursor);
    if (schedule[cursor.getDay()] && !existingDates.has(dateStr)) {
      toInsert.push({ date: dateStr, status: 'absent', checkedInAt: new Date(cursor) });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (toInsert.length === 0) return;
  await db.insert(attendanceRecord).values(toInsert);
  await recomputeStreakState();
}
