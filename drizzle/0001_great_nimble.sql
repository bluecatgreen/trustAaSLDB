CREATE TABLE IF NOT EXISTS `business_transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text,
	`amount` text,
	`transaction_start_date` integer,
	`transaction_end_date` integer,
	`creator_id` text REFERENCES `user`(`id`),
	`creator_role` text,
	`provider_id` text REFERENCES `user`(`id`),
	`provider_name` text,
	`provider_rating` integer,
	`receiver_id` text REFERENCES `user`(`id`),
	`receiver_name` text,
	`receiver_rating` integer,
	`provider_rating_feedback` text,
	`receiver_rating_feedback` text,
	`created_at` integer DEFAULT 1739308800000 NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS `trust_transaction`;
