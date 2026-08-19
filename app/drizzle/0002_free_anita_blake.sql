CREATE TABLE `workout_session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_index` integer NOT NULL,
	`focus` text NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE TABLE `workout_set_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`exercise_name` text NOT NULL,
	`exercise_order` integer NOT NULL,
	`set_number` integer NOT NULL,
	`reps` text NOT NULL,
	`weight_kg` real,
	`rpe` integer,
	`completed_at` integer NOT NULL
);
