CREATE TABLE `import` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`publicId` varchar(12) NOT NULL,
	`source` enum('trello') NOT NULL,
	`createdBy` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` enum('started','success','failed') NOT NULL,
	CONSTRAINT `import_id` PRIMARY KEY(`id`),
	CONSTRAINT `import_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
ALTER TABLE `board` ADD `importId` varchar(255);--> statement-breakpoint
ALTER TABLE `card` ADD `importId` varchar(255);--> statement-breakpoint
ALTER TABLE `label` ADD `importId` varchar(255);--> statement-breakpoint
ALTER TABLE `list` ADD `importId` varchar(255);