ALTER TABLE `card` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `card` ADD `deletedBy` varchar(256);