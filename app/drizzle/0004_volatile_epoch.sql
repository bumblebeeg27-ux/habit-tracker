CREATE TABLE `attendance_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`checked_in_at` integer NOT NULL,
	`workout_session_id` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_record_date_unique` ON `attendance_record` (`date`);--> statement-breakpoint
CREATE TABLE `streak_state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_check_in_date` text
);
