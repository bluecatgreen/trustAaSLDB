CREATE TABLE `market_access_request` (
	`id` text PRIMARY KEY NOT NULL,
	`market_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`requested_at` integer,
	`reviewed_at` integer,
	`reviewed_by` text,
	FOREIGN KEY (`market_id`) REFERENCES `market`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `market_access_request_market_idx` ON `market_access_request` (`market_id`);--> statement-breakpoint
CREATE INDEX `market_access_request_user_idx` ON `market_access_request` (`user_id`);--> statement-breakpoint
CREATE INDEX `market_access_request_status_idx` ON `market_access_request` (`status`);--> statement-breakpoint
CREATE TABLE `market_user` (
	`id` text PRIMARY KEY NOT NULL,
	`market_id` text NOT NULL,
	`user_id` text NOT NULL,
	`associated_at` integer,
	FOREIGN KEY (`market_id`) REFERENCES `market`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `market_user_market_idx` ON `market_user` (`market_id`);--> statement-breakpoint
CREATE INDEX `market_user_user_idx` ON `market_user` (`user_id`);