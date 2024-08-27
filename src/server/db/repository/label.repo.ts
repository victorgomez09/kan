import { generateUID } from "~/utils/generateUID";
import { type Database } from "~/types/database.types";
import { type SupabaseClient } from "@supabase/supabase-js";

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
    publicId: string;
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
    .eq("publicId", labelInput.publicId);

  return data;
};
