import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const userProfile = sqliteTable('user_profile', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  sex: text('sex', { enum: ['male', 'female', 'other'] }).notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  heightCm: real('height_cm').notNull(),
  weightKg: real('weight_kg').notNull(),
  goal: text('goal', {
    enum: ['fat_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'],
  }).notNull(),
  targetWeightKg: real('target_weight_kg'),
  experienceLevel: text('experience_level', {
    enum: ['beginner', 'intermediate', 'advanced'],
  }).notNull(),
  daysPerWeek: integer('days_per_week').notNull(),
  sessionDurationMin: integer('session_duration_min').notNull(),
  equipmentAccess: text('equipment_access', {
    enum: ['full_gym', 'home_dumbbells', 'bodyweight_only', 'bands'],
  }).notNull(),
  activityLevel: text('activity_level', {
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
  }).notNull(),
  injuries: text('injuries'),
  dietaryPreference: text('dietary_preference', {
    enum: ['none', 'vegetarian', 'vegan', 'pescatarian', 'other'],
  }).notNull(),
  allergies: text('allergies'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;

export const workoutProgram = sqliteTable('workout_program', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  durationWeeks: integer('duration_weeks').notNull(),
  daysPerWeek: integer('days_per_week').notNull(),
  planJson: text('plan_json').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type WorkoutProgramRow = typeof workoutProgram.$inferSelect;
export type NewWorkoutProgramRow = typeof workoutProgram.$inferInsert;

export const workoutSession = sqliteTable('workout_session', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dayIndex: integer('day_index').notNull(),
  focus: text('focus').notNull(),
  status: text('status', { enum: ['in_progress', 'completed'] }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export type WorkoutSessionRow = typeof workoutSession.$inferSelect;
export type NewWorkoutSessionRow = typeof workoutSession.$inferInsert;

export const workoutSetLog = sqliteTable('workout_set_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').notNull(),
  exerciseName: text('exercise_name').notNull(),
  exerciseOrder: integer('exercise_order').notNull(),
  setNumber: integer('set_number').notNull(),
  reps: text('reps').notNull(),
  weightKg: real('weight_kg'),
  rpe: integer('rpe'),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
});

export type WorkoutSetLogRow = typeof workoutSetLog.$inferSelect;
export type NewWorkoutSetLogRow = typeof workoutSetLog.$inferInsert;
