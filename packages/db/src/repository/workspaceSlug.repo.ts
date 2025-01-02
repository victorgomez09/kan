import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";

export const getWorkspaceSlug = async (
  db: SupabaseClient<Database>,
  slug: string,
) => {
  const { data } = await db
    .from("workspace_slugs")
    .select(`slug, type`)
    .eq("slug", slug)
    .single();

  return data;
};
