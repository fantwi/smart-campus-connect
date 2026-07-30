CREATE TABLE `issue_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_email` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`location_text` text NOT NULL,
	`latitude` text,
	`longitude` text,
	`photo_key` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `issue_reports_reporter_idx` ON `issue_reports` (`reporter_email`);
