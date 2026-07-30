CREATE TABLE `user_preferences` (
	`email` text PRIMARY KEY NOT NULL,
	`accessibility_required` integer DEFAULT 0 NOT NULL,
	`travel_mode` text DEFAULT 'walking' NOT NULL,
	`saved_places` text DEFAULT '[]' NOT NULL,
	`recent_questions` text DEFAULT '[]' NOT NULL,
	`visit_counts` text DEFAULT '{}' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
