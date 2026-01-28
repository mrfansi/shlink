CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text,
	`timestamp` integer NOT NULL,
	`country` text,
	`city` text,
	`device_type` text,
	`browser` text,
	`os` text,
	`referrer` text,
	`ip_address` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_link_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text,
	`date` text NOT NULL,
	`clicks` integer DEFAULT 0 NOT NULL,
	`metadata` text,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE no action
);
