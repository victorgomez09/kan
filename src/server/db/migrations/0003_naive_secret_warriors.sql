DO $$ BEGIN
 CREATE TYPE "member_status" AS ENUM('invited', 'active', 'removed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "_card_workspace_members" DROP CONSTRAINT "_card_workspace_members_cardId_card_id_fk";
--> statement-breakpoint
ALTER TABLE "_card_labels" DROP CONSTRAINT "_card_labels_cardId_card_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "status" "member_status" DEFAULT 'invited' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_card_workspace_members" ADD CONSTRAINT "_card_workspace_members_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_card_labels" ADD CONSTRAINT "_card_labels_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
