CREATE TABLE `diet_plan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`daily_calories` integer NOT NULL,
	`protein_g` integer NOT NULL,
	`carbs_g` integer NOT NULL,
	`fat_g` integer NOT NULL,
	`plan_json` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
