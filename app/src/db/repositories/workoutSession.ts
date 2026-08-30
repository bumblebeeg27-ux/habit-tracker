import { desc, eq } from 'drizzle-orm';
import { db } from '../client';
import { workoutSession, workoutSetLog } from '../schema';
import { WorkoutDay } from '../../types/workout';
import { checkIn } from './attendance';

export async function startWorkoutSession(day: WorkoutDay): Promise<number> {
  const [row] = await db
    .insert(workoutSession)
    .values({
      dayIndex: day.dayIndex,
      focus: day.focus,
      status: 'in_progress',
      startedAt: new Date(),
    })
    .returning({ id: workoutSession.id });
  return row.id;
}

export async function logSet(params: {
  sessionId: number;
  exerciseName: string;
  exerciseOrder: number;
  setNumber: number;
  reps: string;
  weightKg?: number;
  rpe?: number;
}): Promise<void> {
  await db.insert(workoutSetLog).values({
    sessionId: params.sessionId,
    exerciseName: params.exerciseName,
    exerciseOrder: params.exerciseOrder,
    setNumber: params.setNumber,
    reps: params.reps,
    weightKg: params.weightKg,
    rpe: params.rpe,
    completedAt: new Date(),
  });
}

export async function completeWorkoutSession(sessionId: number): Promise<void> {
  await db
    .update(workoutSession)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(workoutSession.id, sessionId));
  await checkIn(sessionId);
}

export async function getSessionSetLogs(sessionId: number) {
  return db
    .select()
    .from(workoutSetLog)
    .where(eq(workoutSetLog.sessionId, sessionId))
    .orderBy(workoutSetLog.exerciseOrder, workoutSetLog.setNumber);
}

export async function getLastLogForExercise(
  exerciseName: string,
  excludeSessionId: number,
): Promise<{ reps: string; weightKg: number | null } | null> {
  const rows = await db
    .select()
    .from(workoutSetLog)
    .where(eq(workoutSetLog.exerciseName, exerciseName))
    .orderBy(desc(workoutSetLog.completedAt))
    .limit(20);

  const mostRecent = rows.find((row) => row.sessionId !== excludeSessionId);
  if (!mostRecent) return null;
  return { reps: mostRecent.reps, weightKg: mostRecent.weightKg ?? null };
}

export async function getCompletedSessions() {
  return db
    .select()
    .from(workoutSession)
    .where(eq(workoutSession.status, 'completed'))
    .orderBy(desc(workoutSession.completedAt));
}
