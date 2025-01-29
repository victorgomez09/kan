import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";
import { generateUID } from "@kan/shared/utils";

export const create = async (
  db: SupabaseClient<Database>,
  activityInput: {
    type: Database["public"]["Enums"]["card_activity_type"];
    cardId: number;
    fromIndex?: number;
    toIndex?: number;
    fromListId?: number;
    toListId?: number;
    labelId?: number;
    workspaceMemberId?: number;
    fromTitle?: string;
    toTitle?: string;
    fromDescription?: string;
    toDescription?: string;
    createdBy: string;
    commentId?: number;
    fromComment?: string;
    toComment?: string;
  },
) => {
  const { data } = await db
    .from("card_activity")
    .insert({
      publicId: generateUID(),
      type: activityInput.type,
      cardId: activityInput.cardId,
      fromListId: activityInput.fromListId,
      toListId: activityInput.toListId,
      fromIndex: activityInput.fromIndex,
      toIndex: activityInput.toIndex,
      labelId: activityInput.labelId,
      workspaceMemberId: activityInput.workspaceMemberId,
      fromTitle: activityInput.fromTitle,
      toTitle: activityInput.toTitle,
      fromDescription: activityInput.fromDescription,
      toDescription: activityInput.toDescription,
      createdBy: activityInput.createdBy,
      commentId: activityInput.commentId,
      fromComment: activityInput.fromComment,
      toComment: activityInput.toComment,
    })
    .select(`id`)
    .limit(1)
    .single();

  return data;
};

export const bulkCreate = async (
  db: SupabaseClient<Database>,
  activityInputs: {
    type: Database["public"]["Enums"]["card_activity_type"];
    cardId: number;
    fromIndex?: number;
    toIndex?: number;
    fromListId?: number;
    toListId?: number;
    labelId?: number;
    workspaceMemberId?: number;
    fromTitle?: string;
    toTitle?: string;
    fromDescription?: string;
    toDescription?: string;
    createdBy: string;
  }[],
) => {
  const activitiesWithPublicIds = activityInputs.map((activity) => ({
    ...activity,
    publicId: generateUID(),
  }));

  const { data } = await db
    .from("card_activity")
    .insert(activitiesWithPublicIds)
    .select("id");

  return data;
};
