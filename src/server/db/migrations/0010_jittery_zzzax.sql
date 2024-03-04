CREATE TABLE `workspace_members` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`publicId` varchar(12) NOT NULL,
	`userId` varchar(256) NOT NULL,
	`workspaceId` bigint NOT NULL,
	`createdBy` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`deletedAt` timestamp,
	`role` enum('admin','member','guest') NOT NULL,
	CONSTRAINT `workspace_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_members_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
-- ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_workspaceId_workspace_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspace`(`id`) ON DELETE no action ON UPDATE no action;