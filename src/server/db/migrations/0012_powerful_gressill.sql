CREATE TABLE `card_workspace_members` (
	`cardId` bigint NOT NULL,
	`workspaceMemberId` bigint NOT NULL,
	CONSTRAINT `card_workspace_members_cardId_workspaceMemberId` PRIMARY KEY(`cardId`,`workspaceMemberId`)
);
--> statement-breakpoint
-- ALTER TABLE `card_workspace_members` ADD CONSTRAINT `card_workspace_members_cardId_card_id_fk` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE `card_workspace_members` ADD CONSTRAINT `card_workspace_members_workspaceMemberId_workspace_members_id_fk` FOREIGN KEY (`workspaceMemberId`) REFERENCES `workspace_members`(`id`) ON DELETE no action ON UPDATE no action;