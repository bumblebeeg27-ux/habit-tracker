export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
};

export type WorkoutDay = {
  dayIndex: number;
  focus: string;
  exercises: Exercise[];
};

export type WorkoutProgram = {
  durationWeeks: number;
  daysPerWeek: number;
  days: WorkoutDay[];
};
