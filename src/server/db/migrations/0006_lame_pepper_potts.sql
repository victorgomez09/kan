ALTER TABLE `board` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `board` ADD `deletedBy` varchar(256);