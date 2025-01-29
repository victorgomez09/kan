import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";

export const create = async (
  db: SupabaseClient<Database>,
  feedbackInput: {
    feedback: string;
    createdBy: string;
    url: string;
  },
) => {
  const { data } = await db
    .from("feedback")
    .insert({
      feedback: feedbackInput.feedback,
      createdBy: feedbackInput.createdBy,
      url: feedbackInput.url,
    })
    .select(`id`)
    .limit(1)
    .single();

  return data;
};
