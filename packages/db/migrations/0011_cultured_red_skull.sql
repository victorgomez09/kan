ALTER TABLE "apikey" RENAME TO "apiKey";--> statement-breakpoint
ALTER TABLE "apiKey" DROP CONSTRAINT "apikey_userId_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apiKey" ADD CONSTRAINT "apiKey_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
