CREATE TABLE `workout_program` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`duration_weeks` integer NOT NULL,
	`days_per_week` integer NOT NULL,
	`plan_json` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
