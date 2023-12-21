CREATE TABLE `card_label` (
	`cardId` bigint NOT NULL,
	`labelId` bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE `label` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`publicId` varchar(12) NOT NULL,
	`name` varchar(256) NOT NULL,
	`colourCode` varchar(12),
	`createdBy` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`boardId` bigint NOT NULL,
	CONSTRAINT `label_id` PRIMARY KEY(`id`),
	CONSTRAINT `label_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
-- ALTER TABLE `card_label` ADD CONSTRAINT `card_label_cardId_card_id_fk` FOREIGN KEY (`cardId`) REFERENCES `card`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE `card_label` ADD CONSTRAINT `card_label_labelId_label_id_fk` FOREIGN KEY (`labelId`) REFERENCES `label`(`id`) ON DELETE no action ON UPDATE no action;