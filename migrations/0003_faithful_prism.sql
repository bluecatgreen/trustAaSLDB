CREATE TABLE `market_admin` (
	`id` text PRIMARY KEY NOT NULL,
	`market_id` text NOT NULL,
	`user_id` text NOT NULL,
	`assigned_at` integer,
	FOREIGN KEY (`market_id`) REFERENCES `market`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `market_admin_market_idx` ON `market_admin` (`market_id`);--> statement-breakpoint
CREATE INDEX `market_admin_user_idx` ON `market_admin` (`user_id`);