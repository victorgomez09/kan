import type { SupabaseClient } from "@supabase/supabase-js";
import { and, desc, eq, isNull } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import type { Database } from "@kan/db/types/database.types";
import { lists } from "@kan/db/schema";
import { generateUID } from "@kan/shared/utils";

export const create = async (
  db: dbClient,
  listInput: {
    name: string;
    createdBy: string;
    boardId: number;
    index: number;
    importId?: number;
  },
) => {
  const [result] = await db
    .insert(lists)
    .values({
      publicId: generateUID(),
      name: listInput.name,
      createdBy: listInput.createdBy,
      boardId: listInput.boardId,
      index: listInput.index,
      importId: listInput.importId,
    })
    .returning({
      id: lists.id,
      publicId: lists.publicId,
      name: lists.name,
    });

  return result;
};

export const getByPublicId = async (db: dbClient, listPublicId: string) => {
  return db.query.lists.findFirst({
    columns: {
      id: true,
      boardId: true,
      index: true,
    },
    where: eq(lists.publicId, listPublicId),
  });
};

export const getWithCardsByPublicId = async (
  db: dbClient,
  listPublicId: string,
) => {
  return db.query.lists.findFirst({
    columns: {
      id: true,
    },
    with: {
      cards: {
        columns: {
          index: true,
        },
        where: isNull(lists.deletedAt),
        orderBy: [desc(lists.index)],
      },
    },
    where: and(eq(lists.publicId, listPublicId), isNull(lists.deletedAt)),
  });
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

export const softDeleteAllByBoardId = async (
  db: dbClient,
  args: {
    boardId: number;
    deletedBy: string;
  },
) => {
  const [result] = await db
    .update(lists)
    .set({ deletedAt: new Date(), deletedBy: args.deletedBy })
    .where(and(eq(lists.boardId, args.boardId), isNull(lists.deletedAt)))
    .returning({
      id: lists.id,
    });

  return result;
};

export const softDeleteById = async (
  db: dbClient,
  args: {
    listId: number;
    deletedBy: string;
  },
) => {
  const [updatedList] = await db
    .update(lists)
    .set({ deletedAt: new Date(), deletedBy: args.deletedBy })
    .where(and(eq(lists.id, args.listId), isNull(lists.deletedAt)))
    .returning({
      id: lists.id,
    });

  return updatedList;
};
