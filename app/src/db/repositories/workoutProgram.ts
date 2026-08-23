import { eq } from 'drizzle-orm';
import { db } from '../client';
import { workoutProgram } from '../schema';
import { Exercise, WeeklySchedule, WorkoutProgram } from '../../types/workout';

export async function getActiveProgramRow() {
  const rows = await db.select().from(workoutProgram).where(eq(workoutProgram.isActive, true));
  return rows[0] ?? null;
}

export async function getActiveWorkoutProgram(): Promise<WorkoutProgram | null> {
  const row = await getActiveProgramRow();
  if (!row) return null;
  return JSON.parse(row.planJson) as WorkoutProgram;
}

export async function saveWorkoutProgram(program: WorkoutProgram): Promise<void> {
  await db.update(workoutProgram).set({ isActive: false }).where(eq(workoutProgram.isActive, true));
  await db.insert(workoutProgram).values({
    durationWeeks: program.durationWeeks,
    daysPerWeek: program.daysPerWeek,
    planJson: JSON.stringify(program),
    scheduleJson: null,
    isActive: true,
    createdAt: new Date(),
  });
}

// Spreads the N workout days roughly evenly across the week, Monday-first,
// used until the user customizes their own schedule.
function defaultSchedule(daysPerWeek: number): WeeklySchedule {
  const schedule: WeeklySchedule = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
  const mondayFirst = [1, 2, 3, 4, 5, 6, 0];
  const gap = 7 / daysPerWeek;
  for (let i = 0; i < daysPerWeek; i++) {
    const weekday = mondayFirst[Math.round(i * gap) % 7];
    schedule[weekday] = i + 1;
  }
  return schedule;
}

export async function getWeeklySchedule(): Promise<WeeklySchedule | null> {
  const row = await getActiveProgramRow();
  if (!row) return null;
  if (row.scheduleJson) return JSON.parse(row.scheduleJson) as WeeklySchedule;
  return defaultSchedule(row.daysPerWeek);
}

export async function saveWeeklySchedule(schedule: WeeklySchedule): Promise<void> {
  const row = await getActiveProgramRow();
  if (!row) return;
  await db.update(workoutProgram).set({ scheduleJson: JSON.stringify(schedule) }).where(eq(workoutProgram.id, row.id));
}

export async function updateExercise(
  dayIndex: number,
  exerciseIndex: number,
  patch: Partial<Exercise>,
): Promise<void> {
  const row = await getActiveProgramRow();
  if (!row) return;
  const program = JSON.parse(row.planJson) as WorkoutProgram;
  const day = program.days.find((d) => d.dayIndex === dayIndex);
  if (!day || !day.exercises[exerciseIndex]) return;
  day.exercises[exerciseIndex] = { ...day.exercises[exerciseIndex], ...patch };
  await db.update(workoutProgram).set({ planJson: JSON.stringify(program) }).where(eq(workoutProgram.id, row.id));
}
