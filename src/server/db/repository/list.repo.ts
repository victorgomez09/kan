import { generateUID } from "~/utils/generateUID";
import { type Database } from "~/types/database.types";
import { type SupabaseClient } from "@supabase/supabase-js";

export const create = async (
  db: SupabaseClient<Database>,
  listInput: {
    name: string;
    createdBy: string;
    boardId: number;
    index: number;
    importId?: number;
  },
) => {
  const { data } = await db
    .from("list")
    .insert({
      publicId: generateUID(),
      name: listInput.name,
      createdBy: listInput.createdBy,
      boardId: listInput.boardId,
      index: listInput.index,
      importId: listInput.importId,
    })
    .select(
      `
        id,
        publicId,
        name
      `,
    )
    .limit(1)
    .single();

  return data;
};

export const getByPublicId = async (
  db: SupabaseClient<Database>,
  listPublicId: string,
) => {
  const { data } = await db
    .from("list")
    .select(`id, boardId, index`)
    .eq("publicId", listPublicId)
    .limit(1)
    .single();

  return data;
};

export const getWithCardsByPublicId = async (
  db: SupabaseClient<Database>,
  listPublicId: string,
) => {
  const { data } = await db
    .from("list")
    .select(`id, cards:card (index)`)
    .eq("publicId", listPublicId)
    .is("deletedAt", null)
    .is("card.deletedAt", null)
    .order("index", { foreignTable: "card", ascending: false })
    .limit(1)
    .single();

  return data;
};

export const update = async (
  db: SupabaseClient<Database>,
  listInput: {
    name: string;
  },
  args: {
    listPublicId: string;
  },
) => {
  const { data } = await db
    .from("list")
    .update({ name: listInput.name })
    .eq("publicId", args.listPublicId)
    .is("deletedAt", null)
    .select(`publicId, name`);

  return data;
};

export const destroyAllByBoardId = async (
  db: SupabaseClient<Database>,
  args: {
    boardId: number;
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const result = await db
    .from("list")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .eq("boardId", args.boardId)
    .is("deletedAt", null);

  return result;
};

export const destroyById = async (
  db: SupabaseClient<Database>,
  args: {
    listId: number;
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const result = await db
    .from("list")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .eq("id", args.listId)
    .is("deletedAt", null);

  return result;
};

export const reorder = async (
  db: SupabaseClient<Database>,
  args: {
    boardPublicId: number;
    listPublicId: number;
    currentIndex: number;
    newIndex: number;
  },
) => {
  const { data } = await db.rpc("reorder_lists", {
    board_id: args.boardPublicId,
    list_id: args.listPublicId,
    current_index: args.currentIndex,
    new_index: args.newIndex,
  });

  return data;
};

export const shiftIndex = async (
  db: SupabaseClient<Database>,
  args: {
    boardId: number;
    listIndex: number;
  },
) => {
  const { data } = await db.rpc("shift_list_index", {
    board_id: args.boardId,
    list_index: args.listIndex,
  });

  return data;
};
