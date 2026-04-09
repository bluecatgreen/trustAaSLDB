CREATE TABLE `listing` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`amount` text,
	`currency` text DEFAULT 'USD',
	`location_name` text,
	`location_address` text,
	`location_lat` text,
	`location_lon` text,
	`listing_start_date` integer,
	`listing_end_date` integer,
	`status` text DEFAULT 'active',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `market` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`country` text,
	`country_code` text,
	`state` text,
	`city` text,
	`suburb` text,
	`neighbourhood` text,
	`road` text,
	`postcode` text,
	`house_number` text,
	`display_name` text,
	`lat` text,
	`lon` text,
	`unique_fields` text,
	`created_at` integer,
	`creator_id` text,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "is_admin" TO "is_admin" integer NOT NULL;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);