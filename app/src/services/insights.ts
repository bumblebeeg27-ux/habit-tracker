import { AttendanceRecordRow } from '../db/schema';
import { WeeklySchedule, WorkoutProgram } from '../types/workout';

export type ConsistencyInsights = {
  scheduledSoFar: number;
  presentCount: number;
  missedCount: number;
  adherenceRate: number; // 0-1
  projectedExtraDays: number;
  extraDaysPerMiss: number;
};

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type WeeklyBreakdown = {
  weekIndex: number; // 1-based, since program start
  scheduled: number;
  present: number;
};

const MAX_WEEKS_SHOWN = 8;

// Buckets scheduled/present counts by week-since-start, for a simple bar
// chart of consistency over time. Only counts days up to today (future
// scheduled days in the current week aren't counted as "missed" yet).
export function computeWeeklyBreakdown(
  schedule: WeeklySchedule,
  attendanceRows: Pick<AttendanceRecordRow, 'date' | 'status'>[],
  programStartedAt: Date,
): WeeklyBreakdown[] {
  const presentDates = new Set(attendanceRows.filter((r) => r.status === 'present').map((r) => r.date));

  const weeks: WeeklyBreakdown[] = [];
  const cursor = new Date(programStartedAt.getFullYear(), programStartedAt.getMonth(), programStartedAt.getDate());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dayCount = 0;
  while (cursor <= today) {
    const weekIndex = Math.floor(dayCount / 7) + 1;
    let week = weeks[weekIndex - 1];
    if (!week) {
      week = { weekIndex, scheduled: 0, present: 0 };
      weeks.push(week);
    }
    if (schedule[cursor.getDay()]) {
      week.scheduled++;
      if (presentDates.has(toLocalDateString(cursor))) week.present++;
    }
    cursor.setDate(cursor.getDate() + 1);
    dayCount++;
  }

  return weeks.slice(-MAX_WEEKS_SHOWN);
}

// A transparent, simple estimate -- not a scientific prediction. Assumes the
// program's planned duration only holds at 100% adherence to the weekly
// schedule; missed sessions stretch the timeline proportionally.
export function computeConsistencyInsights(
  program: WorkoutProgram,
  schedule: WeeklySchedule,
  attendanceRows: Pick<AttendanceRecordRow, 'date' | 'status'>[],
  programStartedAt: Date,
): ConsistencyInsights {
  const presentDates = new Set(attendanceRows.filter((r) => r.status === 'present').map((r) => r.date));

  let scheduledSoFar = 0;
  let presentCount = 0;
  const cursor = new Date(programStartedAt.getFullYear(), programStartedAt.getMonth(), programStartedAt.getDate());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (cursor <= today) {
    if (schedule[cursor.getDay()]) {
      scheduledSoFar++;
      if (presentDates.has(toLocalDateString(cursor))) presentCount++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const missedCount = Math.max(0, scheduledSoFar - presentCount);
  const adherenceRate = scheduledSoFar > 0 ? presentCount / scheduledSoFar : 1;

  const totalPlannedDays = program.durationWeeks * 7;
  const projectedTotalDays = adherenceRate > 0 ? totalPlannedDays / adherenceRate : totalPlannedDays * 2;
  const projectedExtraDays = Math.max(0, Math.round(projectedTotalDays - totalPlannedDays));
  const extraDaysPerMiss = missedCount > 0 ? projectedExtraDays / missedCount : 0;

  return { scheduledSoFar, presentCount, missedCount, adherenceRate, projectedExtraDays, extraDaysPerMiss };
}
