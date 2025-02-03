CREATE OR REPLACE FUNCTION reorder_lists(board_id BIGINT, list_id BIGINT, current_index INT, new_index INT)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
AS $$
BEGIN
    UPDATE list
      SET index =
        CASE
          WHEN index = current_index AND id = list_id THEN new_index
          WHEN current_index < new_index AND index > current_index AND index <= new_index THEN index - 1
          WHEN current_index > new_index AND index >= new_index AND index < current_index THEN index + 1
          ELSE index
        END
      WHERE "boardId" = board_id;

    -- Check for duplicate indices after the update
    IF EXISTS (
      SELECT index, COUNT(*)
      FROM list 
      WHERE "boardId" = board_id 
      AND "deletedAt" IS NULL
      GROUP BY index
      HAVING COUNT(*) > 1
    ) THEN
      RAISE EXCEPTION 'Duplicate indices found after reordering in board %', board_id;
    END IF;

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION reorder_cards(card_id BIGINT, current_list_id BIGINT, new_list_id BIGINT, current_index INT, new_index INT)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
AS $$
  DECLARE
      card_index INT;
  BEGIN
      SELECT index INTO card_index FROM card WHERE "listId" = current_list_id AND id = card_id AND "deletedAt" IS NULL;
      
      IF current_list_id = new_list_id THEN
          UPDATE card
          SET index =
              CASE
                  WHEN index = current_index THEN new_index
                  WHEN current_index < new_index AND index > current_index AND index <= new_index THEN index - 1
                  WHEN current_index > new_index AND index >= new_index AND index < current_index THEN index + 1
                  ELSE index
              END
          WHERE "listId" = current_list_id AND "deletedAt" IS NULL;
      ELSE
          UPDATE card
          SET index = index + 1
          WHERE "listId" = new_list_id AND index >= new_index AND "deletedAt" IS NULL;

          UPDATE card
          SET index = index - 1
          WHERE "listId" = current_list_id AND index >= current_index AND "deletedAt" IS NULL;

          UPDATE card
          SET "listId" = new_list_id, index = new_index
          WHERE id = card_id AND "deletedAt" IS NULL;
      END IF;

      -- Check for duplicate indices in both affected lists
      IF EXISTS (
        SELECT index, COUNT(*)
        FROM card 
        WHERE "listId" IN (current_list_id, new_list_id)
        AND "deletedAt" IS NULL
        GROUP BY "listId", index
        HAVING COUNT(*) > 1
      ) THEN
        RAISE EXCEPTION 'Duplicate indices found after reordering in list % or %', current_list_id, new_list_id;
      END IF;

      RETURN TRUE;
  END;
$$;

CREATE OR REPLACE FUNCTION shift_list_index(board_id BIGINT, list_index INT)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE list
    SET index = index - 1
    WHERE "boardId" = board_id AND index > list_index AND "deletedAt" IS NULL;
$$;

CREATE OR REPLACE FUNCTION shift_card_index(list_id BIGINT, card_index INT)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE card
    SET index = index - 1
    WHERE "listId" = list_id AND index > card_index AND "deletedAt" IS NULL;
$$;

CREATE OR REPLACE FUNCTION push_card_index(list_id BIGINT, card_index INT)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE card
    SET index = index + 1
    WHERE "listId" = list_id AND index >= card_index AND "deletedAt" IS NULL;
$$;

CREATE OR REPLACE FUNCTION is_workspace_admin(user_id UUID, workspace_id BIGINT)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE "workspaceId" = workspace_id
      AND "userId" = user_id
      AND "role" = 'admin'
  );
$$;

alter table "_card_labels" enable row level security;
alter table "_card_workspace_members" enable row level security;
alter table "_card_activity" enable row level security;
alter table "_card_comments" enable row level security;
alter table "board" enable row level security;
alter table "card" enable row level security;
alter table "import" enable row level security;
alter table "label" enable row level security;
alter table "user" enable row level security;
alter table "list" enable row level security;
alter table "workspace" enable row level security;
alter table "workspace_members" enable row level security;
alter table "workspace_slugs" enable row level security;


/* BOARD */
CREATE POLICY "Allow access to boards in user's workspace or public boards"
ON public.board
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  "workspaceId" IN (
    SELECT "workspaceId"
    FROM workspace_members
    WHERE "userId" = auth.uid()
  )
  OR visibility = 'public'
);

CREATE POLICY "Allow inserting boards in user's workspace"
ON public.board
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  "workspaceId" IN (
    SELECT "workspaceId"
    FROM workspace_members
    WHERE "userId" = auth.uid()
  )
);

CREATE POLICY "Allow updating boards in user's workspace"
ON public.board
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  "workspaceId" IN (
    SELECT "workspaceId"
    FROM workspace_members
    WHERE "userId" = auth.uid()
  )
);

CREATE POLICY "Allow deleting boards in user's workspace"
ON public.board
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  "workspaceId" IN (
    SELECT "workspaceId"
    FROM workspace_members
    WHERE "userId" = auth.uid()
  )
);

CREATE POLICY "Allow modifications to boards in user's workspace"
ON public.board
AS PERMISSIVE
FOR INSERT 
TO authenticated
USING (
  "workspaceId" IN (
    SELECT "workspaceId"
    FROM workspace_members
    WHERE "userId" = auth.uid()
  )
);

/* LIST */
CREATE POLICY "Allow access to lists in user's workspace or public boards"
ON public.list
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  "boardId" IN (
    SELECT b.id
    FROM board b
    LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
      OR b.visibility = 'public'
  )
);

CREATE POLICY "Allow inserting lists in user's workspace"
ON public.list
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  "boardId" IN (
    SELECT b.id
    FROM board b
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

CREATE POLICY "Allow updating lists in user's workspace"
ON public.list
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  "boardId" IN (
    SELECT b.id
    FROM board b
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

CREATE POLICY "Allow deleting lists in user's workspace"
ON public.list
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  "boardId" IN (
    SELECT b.id
    FROM board b
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

/* CARD */
CREATE POLICY "Allow access to cards in user's workspace or public boards"
ON public.card
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  "listId" IN (
    SELECT l.id
    FROM list l
    JOIN board b ON l."boardId" = b.id
    LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
      OR b.visibility = 'public'
  )
);

CREATE POLICY "Allow inserting cards in user's workspace"
ON public.card
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  "listId" IN (
    SELECT l.id
    FROM list l
    JOIN board b ON l."boardId" = b.id
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

CREATE POLICY "Allow updating cards in user's workspace"
ON public.card
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  "listId" IN (
    SELECT l.id
    FROM list l
    JOIN board b ON l."boardId" = b.id
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

CREATE POLICY "Allow deleting cards in user's workspace"
ON public.card
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  "listId" IN (
    SELECT l.id
    FROM list l
    JOIN board b ON l."boardId" = b.id
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

/* LABEL */
CREATE POLICY "Allow access to labels in user's workspace or public boards"
ON public.label
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  "boardId" IN (
    SELECT b.id
    FROM board b
    LEFT JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
      OR b.visibility = 'public'
  )
);

CREATE POLICY "Allow inserting labels in user's workspace"
ON public.label
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  "boardId" IN (
    SELECT b.id
    FROM board b
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

CREATE POLICY "Allow updating labels in user's workspace"
ON public.label
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  "boardId" IN (
    SELECT b.id
    FROM board b
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

CREATE POLICY "Allow deleting labels in user's workspace"
ON public.label
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  "boardId" IN (
    SELECT b.id
    FROM board b
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

/* CARD LABELS */
CREATE POLICY "Allow access to card labels in user's workspace or public boards"
ON public._card_labels
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
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
);

CREATE POLICY "Allow inserting card labels in user's workspace"
ON public._card_labels
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
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
);

CREATE POLICY "Allow updating card labels in user's workspace"
ON public._card_labels
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
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
);

CREATE POLICY "Allow deleting card labels in user's workspace"
ON public._card_labels
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
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
);

/* CARD ACTIVITY */
CREATE POLICY "Allow access to card activity in user's workspace or public boards"
ON public.card_activity
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  "cardId" IN (
    SELECT c.id
    FROM card c
    JOIN list l ON c."listId" = l.id
    JOIN board b ON l."boardId" = b.id
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
      OR b.visibility = 'public'
  )
);

CREATE POLICY "Allow inserting card activity in user's workspace"
ON public.card_activity
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  "cardId" IN (
    SELECT c.id
    FROM card c
    JOIN list l ON c."listId" = l.id
    JOIN board b ON l."boardId" = b.id
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

/* CARD COMMENTS */
CREATE POLICY "Allow access to card comments in user's workspace or public boards"
ON public.card_comments
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  "cardId" IN (
    SELECT c.id
    FROM card c
    JOIN list l ON c."listId" = l.id
    JOIN board b ON l."boardId" = b.id
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
      OR b.visibility = 'public'
  )
);

CREATE POLICY "Allow inserting comments on cards in user's workspace"
ON public.card_comments
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  "cardId" IN (
    SELECT c.id
    FROM card c
    JOIN list l ON c."listId" = l.id
    JOIN board b ON l."boardId" = b.id
    JOIN workspace_members wm ON b."workspaceId" = wm."workspaceId"
    WHERE wm."userId" = auth.uid()
  )
);

CREATE POLICY "Allow updating own comments"
ON public.card_comments
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  "createdBy" = auth.uid()
);

CREATE POLICY "Allow deleting own comments"
ON public.card_comments
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  "createdBy" = auth.uid()
);

/* CARD WORKSPACE MEMBERS */
CREATE POLICY "Allow access to card workspace members in user's workspace"
ON public._card_workspace_members
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
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
);

/* USER */
CREATE POLICY "Allow viewing members in user's workspace"
ON public.user
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT wm."userId"
    FROM workspace_members wm
    WHERE wm."workspaceId" IN (
      SELECT "workspaceId"
      FROM workspace_members
      WHERE "userId" = auth.uid()
    )
  )
);

/* WORKSPACE */
CREATE POLICY "Allow viewing user's workspaces"
ON public.workspace
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN
      -- For anonymous users, only allow access through public boards
      EXISTS (
        SELECT 1 
        FROM board 
        WHERE "workspaceId" = workspace.id 
        AND visibility = 'public'
      )
    ELSE
      -- For authenticated users, allow access to their workspaces
      id IN (
        SELECT "workspaceId"
        FROM workspace_members
        WHERE "userId" = auth.uid()
      )
      OR "createdBy" = auth.uid()
  END
);

CREATE POLICY "Allow updating user's workspaces"
ON public.workspace
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT "workspaceId"
    FROM workspace_members
    WHERE "userId" = auth.uid()
  )
);

CREATE POLICY "Allow deleting user's workspaces"
ON public.workspace
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  id IN (
    SELECT "workspaceId"
    FROM workspace_members
    WHERE "userId" = auth.uid()
  )
);

CREATE POLICY "Allow authenticated users to create workspaces"
ON public.workspace
AS PERMISSIVE
FOR INSERT
TO authenticated
USING (true);

/* WORKSPACE MEMBERS */
CREATE POLICY "Allow members to view workspace membership"
ON public.workspace_members
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  "userId" = auth.uid() OR
  is_workspace_admin(auth.uid(), "workspaceId")
);

CREATE POLICY "Allow admins to add workspace members"
ON public.workspace_members
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  is_workspace_admin(auth.uid(), "workspaceId")
);

CREATE POLICY "Allow admins to update workspace members"
ON public.workspace_members
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  is_workspace_admin(auth.uid(), "workspaceId")
);

CREATE POLICY "Allow admins to remove workspace members"
ON public.workspace_members
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  is_workspace_admin(auth.uid(), "workspaceId")
);

/* IMPORT */
CREATE POLICY "Allow access to user's own imports"
ON public.import
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  "createdBy" = auth.uid()
);

/* BUCKETS */
insert into storage.buckets
  (id, name, public)
values
  ('avatars', 'avatars', true);

alter table storage.objects enable row level security;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');