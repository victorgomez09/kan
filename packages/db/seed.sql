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