import type { SupabaseClient } from "@supabase/supabase-js";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";

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
  db: dbClient,
  listInput: {
    name: string;
  },
  args: {
    listPublicId: string;
  },
) => {
  const [result] = await db
    .update(lists)
    .set({ name: listInput.name })
    .where(and(eq(lists.publicId, args.listPublicId), isNull(lists.deletedAt)))
    .returning({
      publicId: lists.publicId,
      name: lists.name,
    });

  return result;
};

export const reorder = async (
  db: dbClient,
  args: {
    listPublicId: string;
    newIndex: number;
  },
) => {
  return db.transaction(async (tx) => {
    const list = await tx.query.lists.findFirst({
      columns: {
        id: true,
        boardId: true,
        index: true,
      },
      where: eq(lists.publicId, args.listPublicId),
    });

    if (!list)
      throw new Error(`List not found for public ID ${args.listPublicId}`);

    await tx.execute(sql`
      UPDATE list
      SET index =
        CASE
          WHEN index = ${list.index} AND id = ${list.id} THEN ${args.newIndex}
          WHEN ${list.index} < ${args.newIndex} AND index > ${list.index} AND index <= ${args.newIndex} THEN index - 1
          WHEN ${list.index} > ${args.newIndex} AND index >= ${args.newIndex} AND index < ${list.index} THEN index + 1
          ELSE index
        END
      WHERE "boardId" = ${list.boardId};
    `);

    const countExpr = sql<number>`COUNT(*)`.mapWith(Number);

    const duplicateIndices = await db
      .select({
        index: lists.index,
        count: countExpr,
      })
      .from(lists)
      .where(and(eq(lists.boardId, list.boardId), isNull(lists.deletedAt)))
      .groupBy(lists.index)
      .having(gt(countExpr, 1));

    if (duplicateIndices.length > 0) {
      throw new Error(
        `Duplicate indices found after reordering in board ${list.boardId}`,
      );
    }

    const updatedList = await tx.query.lists.findFirst({
      columns: {
        publicId: true,
        name: true,
      },
      where: eq(lists.publicId, args.listPublicId),
    });

    return updatedList;
  });
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
    deletedAt: Date;
    deletedBy: string;
  },
) => {
  const [result] = await db
    .update(lists)
    .set({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
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
    deletedAt: Date;
    deletedBy: string;
  },
) => {
  const [updatedList] = await db
    .update(lists)
    .set({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .where(and(eq(lists.id, args.listId), isNull(lists.deletedAt)))
    .returning({
      id: lists.id,
    });

  return updatedList;
};
