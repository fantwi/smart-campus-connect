CREATE TABLE `ai_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_email` text,
	`message_id` text NOT NULL,
	`rating` text NOT NULL,
	`question` text,
	`answer` text NOT NULL,
	`correction` text,
	`place_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
