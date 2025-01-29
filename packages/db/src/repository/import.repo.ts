import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";
import { generateUID } from "@kan/shared/utils";

export const create = async (
  db: SupabaseClient<Database>,
  importInput: { source: string; createdBy: string },
) => {
  const { data } = await db
    .from("import")
    .insert({
      publicId: generateUID(),
      source: "trello",
      createdBy: importInput.createdBy,
      status: "started",
    })
    .select(`id`)
    .limit(1)
    .single();

  return data;
};

export const update = async (
  db: SupabaseClient<Database>,
  importInput: { status: "started" | "success" | "failed" },
  args: { importId: number },
) => {
  const { data } = await db
    .from("import")
    .update({ status: importInput.status })
    .eq("importId", args.importId)
    .limit(1)
    .single();

  return data;
};
