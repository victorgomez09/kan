DROP POLICY "Allow access to boards in user's workspace or public boards" ON "board" CASCADE;--> statement-breakpoint
DROP POLICY "Allow inserting boards in user's workspace" ON "board" CASCADE;--> statement-breakpoint
DROP POLICY "Allow updating boards in user's workspace" ON "board" CASCADE;--> statement-breakpoint
DROP POLICY "Allow deleting boards in user's workspace" ON "board" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to card activity in user's workspace or public boards" ON "card_activity" CASCADE;--> statement-breakpoint
DROP POLICY "Allow inserting card activity in user's workspace" ON "card_activity" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to card workspace members in user's workspace" ON "_card_workspace_members" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to cards in user's workspace or public boards" ON "card" CASCADE;--> statement-breakpoint
DROP POLICY "Allow inserting cards in user's workspace" ON "card" CASCADE;--> statement-breakpoint
DROP POLICY "Allow updating cards in user's workspace" ON "card" CASCADE;--> statement-breakpoint
DROP POLICY "Allow deleting cards in user's workspace" ON "card" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to card labels in user's workspace or public boards" ON "_card_labels" CASCADE;--> statement-breakpoint
DROP POLICY "Allow inserting card labels in user's workspace" ON "_card_labels" CASCADE;--> statement-breakpoint
DROP POLICY "Allow updating card labels in user's workspace" ON "_card_labels" CASCADE;--> statement-breakpoint
DROP POLICY "Allow deleting card labels in user's workspace" ON "_card_labels" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to card comments in user's workspace or public boards" ON "card_comments" CASCADE;--> statement-breakpoint
DROP POLICY "Allow inserting comments on cards in user's workspace" ON "card_comments" CASCADE;--> statement-breakpoint
DROP POLICY "Allow updating own comments" ON "card_comments" CASCADE;--> statement-breakpoint
DROP POLICY "Allow deleting own comments" ON "card_comments" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to user's own imports" ON "import" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to labels in user's workspace or public boards" ON "label" CASCADE;--> statement-breakpoint
DROP POLICY "Allow inserting labels in user's workspace" ON "label" CASCADE;--> statement-breakpoint
DROP POLICY "Allow updating labels in user's workspace" ON "label" CASCADE;--> statement-breakpoint
DROP POLICY "Allow deleting labels in user's workspace" ON "label" CASCADE;--> statement-breakpoint
DROP POLICY "Allow access to lists in user's workspace or public boards" ON "list" CASCADE;--> statement-breakpoint
DROP POLICY "Allow inserting lists in user's workspace" ON "list" CASCADE;--> statement-breakpoint
DROP POLICY "Allow updating lists in user's workspace" ON "list" CASCADE;--> statement-breakpoint
DROP POLICY "Allow deleting lists in user's workspace" ON "list" CASCADE;--> statement-breakpoint
DROP POLICY "Allow viewing members in user's workspace" ON "user" CASCADE;--> statement-breakpoint
DROP POLICY "Allow members to view workspace membership" ON "workspace_members" CASCADE;--> statement-breakpoint
DROP POLICY "Allow admins to add workspace members" ON "workspace_members" CASCADE;--> statement-breakpoint
DROP POLICY "Allow admins to update workspace members" ON "workspace_members" CASCADE;--> statement-breakpoint
DROP POLICY "Allow admins to remove workspace members" ON "workspace_members" CASCADE;--> statement-breakpoint
DROP POLICY "Allow viewing user's workspaces" ON "workspace" CASCADE;--> statement-breakpoint
DROP POLICY "Allow updating user's workspaces" ON "workspace" CASCADE;--> statement-breakpoint
DROP POLICY "Allow deleting user's workspaces" ON "workspace" CASCADE;--> statement-breakpoint
DROP POLICY "Allow authenticated users to create workspaces" ON "workspace" CASCADE;