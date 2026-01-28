CREATE TABLE `global_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`original_url` text NOT NULL,
	`user_id` text,
	`created_at` integer NOT NULL,
	`expires_at` integer,
	`password_hash` text,
	`is_active` integer DEFAULT true,
	`tags` text,
	`metadata` text,
	`click_count` integer DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_slug_unique` ON `links` (`slug`);