ALTER TABLE `card` DROP CONSTRAINT `card_listId_index_unique`;--> statement-breakpoint
ALTER TABLE `list` DROP CONSTRAINT `list_boardId_index_unique`;--> statement-breakpoint
ALTER TABLE `board` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `card` MODIFY COLUMN `description` text;