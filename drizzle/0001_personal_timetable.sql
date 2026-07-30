CREATE TABLE `timetable_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_email` text NOT NULL,
	`course_code` text NOT NULL,
	`title` text NOT NULL,
	`venue` text NOT NULL,
	`place_id` integer,
	`day_of_week` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`reminder_minutes` integer DEFAULT 20 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `timetable_profile_email_idx` ON `timetable_entries` (`profile_email`);
