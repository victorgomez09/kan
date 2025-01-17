CREATE TYPE "public"."board_visibility" AS ENUM('private', 'public');--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "visibility" "board_visibility" DEFAULT 'private' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "board_visibility_idx" ON "board" USING btree ("visibility");