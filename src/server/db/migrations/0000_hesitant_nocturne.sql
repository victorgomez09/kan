CREATE TABLE `account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `account_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `board` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`publicId` varchar(12) NOT NULL,
	`name` varchar(255),
	`createdBy` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `board_id` PRIMARY KEY(`id`),
	CONSTRAINT `board_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `card` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`publicId` varchar(12) NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` varchar(256),
	`createdBy` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`listId` bigint NOT NULL,
	`index` int NOT NULL,
	CONSTRAINT `card_id` PRIMARY KEY(`id`),
	CONSTRAINT `card_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `card_listId_index_unique` UNIQUE(`listId`,`index`)
);
--> statement-breakpoint
CREATE TABLE `list` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`publicId` varchar(12) NOT NULL,
	`name` varchar(256) NOT NULL,
	`createdBy` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`boardId` bigint NOT NULL,
	`index` int NOT NULL,
	CONSTRAINT `list_id` PRIMARY KEY(`id`),
	CONSTRAINT `list_publicId_unique` UNIQUE(`publicId`),
	CONSTRAINT `list_boardId_index_unique` UNIQUE(`boardId`,`index`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp(3) DEFAULT CURRENT_TIMESTAMP(3),
	`image` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verificationToken_identifier_token` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `session` (`userId`);