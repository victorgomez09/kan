

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

CREATE OR REPLACE FUNCTION is_workspace_member(user_id UUID, workspace_id BIGINT) 
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE "userId" = user_id AND "workspaceId" = workspace_id
  );
$$;

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