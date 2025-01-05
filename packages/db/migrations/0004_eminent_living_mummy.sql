-- First add the columns without NOT NULL constraint
ALTER TABLE "board" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "slug" varchar(255);--> statement-breakpoint

-- Update existing records with a default slug (using board id to ensure uniqueness)
UPDATE "board" SET "slug" = 'board-' || id::text;--> statement-breakpoint

-- Now add the NOT NULL constraint
ALTER TABLE "board" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

-- Finally create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS "unique_slug_per_workspace" ON "board" USING btree ("workspaceId","slug");