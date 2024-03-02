CREATE TABLE `workspace` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`publicId` varchar(12) NOT NULL,
	`name` varchar(256) NOT NULL,
	`slug` varchar(256) NOT NULL,
	`createdBy` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	`deletedBy` varchar(256),
	CONSTRAINT `workspace_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
ALTER TABLE `board` MODIFY COLUMN `importId` varchar(256);--> statement-breakpoint
ALTER TABLE `board` ADD `workspaceId` varchar(256);