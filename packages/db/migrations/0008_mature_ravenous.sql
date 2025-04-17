ALTER TABLE "board" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "card_activity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "_card_workspace_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "card" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "_card_labels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "card_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "import" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "label" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "list" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workspace" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Allow access to boards in user's workspace or public boards" ON "board" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
        OR visibility = 'public'
      );--> statement-breakpoint
CREATE POLICY "Allow inserting boards in user's workspace" ON "board" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow updating boards in user's workspace" ON "board" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow deleting boards in user's workspace" ON "board" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
        "workspaceId" IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow access to card activity in user's workspace or public boards" ON "card_activity" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
        "cardId" IN (
          SELECT c.id
          FROM card c
          JOIN list l ON c."listId" = l.id
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
            OR b.visibility = 'public'
        )
      );--> statement-breakpoint
CREATE POLICY "Allow inserting card activity in user's workspace" ON "card_activity" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        "cardId" IN (
          SELECT c.id
          FROM card c
          JOIN list l ON c."listId" = l.id
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow access to card workspace members in user's workspace" ON "_card_workspace_members" AS PERMISSIVE FOR ALL TO "authenticated" USING (
        "cardId" IN (
          SELECT c.id
          FROM card c
          JOIN list l ON c."listId" = l.id
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
        AND
        "workspaceMemberId" IN (
          SELECT wm.id
          FROM workspace_members wm
          WHERE wm."workspaceId" IN (
            SELECT "workspaceId"
            FROM workspace_members
            WHERE "userId" = auth.uid()
          )
        )
      );--> statement-breakpoint
CREATE POLICY "Allow access to cards in user's workspace or public boards" ON "card" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
            OR b.visibility = 'public'
        )
      );--> statement-breakpoint
CREATE POLICY "Allow inserting cards in user's workspace" ON "card" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow updating cards in user's workspace" ON "card" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow deleting cards in user's workspace" ON "card" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
        "listId" IN (
          SELECT l.id
          FROM list l
          JOIN board b ON l."boardId" = b.id
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow access to card labels in user's workspace or public boards" ON "_card_labels" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId" AND wm."userId" = auth.uid()
        WHERE wm."userId" = auth.uid()
          OR b.visibility = 'public'
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId" AND wm."userId" = auth.uid()
        WHERE wm."userId" = auth.uid()
          OR b.visibility = 'public'
      )
    );--> statement-breakpoint
CREATE POLICY "Allow inserting card labels in user's workspace" ON "_card_labels" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    );--> statement-breakpoint
CREATE POLICY "Allow updating card labels in user's workspace" ON "_card_labels" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    );--> statement-breakpoint
CREATE POLICY "Allow deleting card labels in user's workspace" ON "_card_labels" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
      AND
      "labelId" IN (
        SELECT l.id
        FROM label l
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    );--> statement-breakpoint
CREATE POLICY "Allow access to card comments in user's workspace or public boards" ON "card_comments" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
          OR b.visibility = 'public'
      )
    );--> statement-breakpoint
CREATE POLICY "Allow inserting comments on cards in user's workspace" ON "card_comments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
      "cardId" IN (
        SELECT c.id
        FROM card c
        JOIN list l ON c."listId" = l.id
        JOIN board b ON l."boardId" = b.id
        JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
        WHERE wm."userId" = auth.uid()
      )
    );--> statement-breakpoint
CREATE POLICY "Allow updating own comments" ON "card_comments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
      "createdBy" = auth.uid()
    );--> statement-breakpoint
CREATE POLICY "Allow deleting own comments" ON "card_comments" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
      "createdBy" = auth.uid()
    );--> statement-breakpoint
CREATE POLICY "Allow access to user's own imports" ON "import" AS PERMISSIVE FOR ALL TO "authenticated" USING (
        "createdBy" = auth.uid()
      );--> statement-breakpoint
CREATE POLICY "Allow access to labels in user's workspace or public boards" ON "label" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
        "boardId" IN (
          SELECT b.id
          FROM board b
          LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
            OR b.visibility = 'public'
        )
      );--> statement-breakpoint
CREATE POLICY "Allow inserting labels in user's workspace" ON "label" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow updating labels in user's workspace" ON "label" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow deleting labels in user's workspace" ON "label" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow access to lists in user's workspace or public boards" ON "list" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
        "boardId" IN (
          SELECT b.id
          FROM board b
          LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
            OR b.visibility = 'public'
        )
      );--> statement-breakpoint
CREATE POLICY "Allow inserting lists in user's workspace" ON "list" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow updating lists in user's workspace" ON "list" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow deleting lists in user's workspace" ON "list" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
        "boardId" IN (
          SELECT b.id
          FROM board b
          JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
          WHERE wm."userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow viewing members in user's workspace" ON "user" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        id IN (
          SELECT wm."userId"
          FROM workspace_members wm
          WHERE wm."workspaceId" IN (
            SELECT "workspaceId"
            FROM workspace_members
            WHERE "userId" = auth.uid()
          )
        )
      );--> statement-breakpoint
CREATE POLICY "Allow members to view workspace membership" ON "workspace_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        "userId" = auth.uid() OR
        is_workspace_member(auth.uid(), "workspaceId")
      );--> statement-breakpoint
CREATE POLICY "Allow admins to add workspace members" ON "workspace_members" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        is_workspace_admin(auth.uid(), "workspaceId")
      );--> statement-breakpoint
CREATE POLICY "Allow admins to update workspace members" ON "workspace_members" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        is_workspace_admin(auth.uid(), "workspaceId")
      );--> statement-breakpoint
CREATE POLICY "Allow admins to remove workspace members" ON "workspace_members" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
        is_workspace_admin(auth.uid(), "workspaceId")
      );--> statement-breakpoint
CREATE POLICY "Allow viewing user's workspaces" ON "workspace" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (
        CASE 
          WHEN auth.uid() IS NULL THEN
            EXISTS (
              SELECT 1 
              FROM board 
              WHERE "workspaceId" = workspace.id 
              AND visibility = 'public'
            )
          ELSE
            id IN (
              SELECT "workspaceId"
              FROM workspace_members
              WHERE "userId" = auth.uid()
            )
            OR "createdBy" = auth.uid()
        END
      );--> statement-breakpoint
CREATE POLICY "Allow updating user's workspaces" ON "workspace" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (
        id IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow deleting user's workspaces" ON "workspace" AS PERMISSIVE FOR DELETE TO "authenticated" USING (
        id IN (
          SELECT "workspaceId"
          FROM workspace_members
          WHERE "userId" = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "Allow authenticated users to create workspaces" ON "workspace" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);