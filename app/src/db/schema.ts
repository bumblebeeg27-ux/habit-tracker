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

export const dietPlan = sqliteTable('diet_plan', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dailyCalories: integer('daily_calories').notNull(),
  proteinG: integer('protein_g').notNull(),
  carbsG: integer('carbs_g').notNull(),
  fatG: integer('fat_g').notNull(),
  planJson: text('plan_json').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type DietPlanRow = typeof dietPlan.$inferSelect;
export type NewDietPlanRow = typeof dietPlan.$inferInsert;

export const attendanceRecord = sqliteTable('attendance_record', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(), // YYYY-MM-DD, local calendar day
  checkedInAt: integer('checked_in_at', { mode: 'timestamp' }).notNull(),
  workoutSessionId: integer('workout_session_id'),
});

export type AttendanceRecordRow = typeof attendanceRecord.$inferSelect;
export type NewAttendanceRecordRow = typeof attendanceRecord.$inferInsert;

// Single-row cache derived from attendanceRecord -- avoids recomputing the
// streak from full history on every read.
export const streakState = sqliteTable('streak_state', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastCheckInDate: text('last_check_in_date'), // YYYY-MM-DD
});

export type StreakStateRow = typeof streakState.$inferSelect;
export type NewStreakStateRow = typeof streakState.$inferInsert;

export const chatMessage = sqliteTable('chat_message', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  role: text('role', { enum: ['user', 'model'] }).notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type ChatMessageRow = typeof chatMessage.$inferSelect;
export type NewChatMessageRow = typeof chatMessage.$inferInsert;
