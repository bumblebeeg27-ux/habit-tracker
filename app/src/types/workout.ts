export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
  // User-attached media, shown in place of the auto-matched reference image.
  customImageUri?: string;
  customVideoUrl?: string;
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

// Weekday (0=Sun..6=Sat) -> program dayIndex, or null for a rest day.
export type WeeklySchedule = Record<number, number | null>;
