ALTER TYPE "card_activity_type" ADD VALUE 'card.updated.comment.added';--> statement-breakpoint
ALTER TYPE "card_activity_type" ADD VALUE 'card.updated.comment.updated';--> statement-breakpoint
ALTER TYPE "card_activity_type" ADD VALUE 'card.updated.comment.deleted';--> statement-breakpoint
ALTER TABLE "card_activity" ADD COLUMN "commentId" bigint;--> statement-breakpoint
ALTER TABLE "card_activity" ADD COLUMN "fromComment" text;--> statement-breakpoint
ALTER TABLE "card_activity" ADD COLUMN "toComment" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_activity" ADD CONSTRAINT "card_activity_commentId_card_comments_id_fk" FOREIGN KEY ("commentId") REFERENCES "card_comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
