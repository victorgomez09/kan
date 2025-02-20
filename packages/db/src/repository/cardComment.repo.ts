import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";
import { generateUID } from "@kan/shared/utils";

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

export const getByPublicId = async (
  db: SupabaseClient<Database>,
  publicId: string,
) => {
  const { data } = await db
    .from("card_comments")
    .select(`id, publicId, comment, createdBy`)
    .eq("publicId", publicId)
    .limit(1)
    .single();

  return data;
};

export const update = async (
  db: SupabaseClient<Database>,
  commentInput: {
    id: number;
    comment: string;
  },
) => {
  const { data } = await db
    .from("card_comments")
    .update({
      comment: commentInput.comment,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", commentInput.id)
    .select(`id, publicId, comment`)
    .limit(1)
    .order("id", { ascending: false })
    .single();

  return data;
};

export const softDelete = async (
  db: SupabaseClient<Database>,
  args: {
    commentId: number;
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const { data } = await db
    .from("card_comments")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .eq("id", args.commentId)
    .select(`id`)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  return data;
};
