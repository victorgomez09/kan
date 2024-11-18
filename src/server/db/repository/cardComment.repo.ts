import { generateUID } from "~/utils/generateUID";
import { type Database } from "~/types/database.types";
import { type SupabaseClient } from "@supabase/supabase-js";

export const create = async (
  db: SupabaseClient<Database>,
  commentInput: {
    cardId: number;
    comment: string;
    createdBy: string;
  },
) => {
  const { data } = await db
    .from("card_comments")
    .insert({
      publicId: generateUID(),
      comment: commentInput.comment,
      createdBy: commentInput.createdBy,
      cardId: commentInput.cardId,
    })
    .select(`id, publicId, comment`)
    .limit(1)
    .single();

  return data;
};
