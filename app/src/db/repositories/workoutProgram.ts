import { eq } from 'drizzle-orm';
import { db } from '../client';
import { workoutProgram } from '../schema';
import { WorkoutProgram } from '../../types/workout';

export async function getActiveWorkoutProgram(): Promise<WorkoutProgram | null> {
  const rows = await db.select().from(workoutProgram).where(eq(workoutProgram.isActive, true));
  const row = rows[0];
  if (!row) return null;
  return JSON.parse(row.planJson) as WorkoutProgram;
}

export async function saveWorkoutProgram(program: WorkoutProgram): Promise<void> {
  await db.update(workoutProgram).set({ isActive: false }).where(eq(workoutProgram.isActive, true));
  await db.insert(workoutProgram).values({
    durationWeeks: program.durationWeeks,
    daysPerWeek: program.daysPerWeek,
    planJson: JSON.stringify(program),
    isActive: true,
    createdAt: new Date(),
  });
}
