import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";
import { generateUID } from "@kan/shared/utils";

export const create = async (
  db: SupabaseClient<Database>,
  labelInput: {
    name: string;
    colourCode: string;
    createdBy: string;
    boardId: number;
    cardId?: number;
  },
) => {
  const { data } = await db
    .from("label")
    .insert({
      publicId: generateUID(),
      name: labelInput.name,
      colourCode: labelInput.colourCode,
      createdBy: labelInput.createdBy,
      boardId: labelInput.boardId,
    })
    .select(`id`)
    .limit(1)
    .single();

  if (labelInput.cardId && data)
    await db.from("_card_labels").insert({
      cardId: labelInput.cardId,
      labelId: data.id,
    });

  return data;
};

export const bulkCreate = async (
  db: SupabaseClient<Database>,
  labels: {
    publicId: string;
    name: string;
    colourCode: string;
    boardId: number;
    createdBy: string;
  }[],
) => {
  const { data } = await db.from("label").insert(labels).select(`id`);

  return data;
};

export const getAllByPublicIds = async (
  db: SupabaseClient<Database>,
  labelPublicIds: string[],
) => {
  const { data } = await db
    .from("label")
    .select(`id`)
    .in("publicId", labelPublicIds);

  return data;
};

export const getByPublicId = async (
  db: SupabaseClient<Database>,
  labelPublicId: string,
) => {
  const { data } = await db
    .from("label")
    .select(`id, publicId, name, colourCode`)
    .eq("publicId", labelPublicId)
    .limit(1)
    .single();

  return data;
};

export const update = async (
  db: SupabaseClient<Database>,
  labelInput: {
    labelPublicId: string;
    name: string;
    colourCode: string;
  },
) => {
  const { data } = await db
    .from("label")
    .update({
      name: labelInput.name,
      colourCode: labelInput.colourCode,
    })
    .eq("publicId", labelInput.labelPublicId);

  return data;
};

export const hardDelete = async (
  db: SupabaseClient<Database>,
  labelId: number,
) => {
  const { data } = await db.from("label").delete().eq("id", labelId);

  return data;
};
