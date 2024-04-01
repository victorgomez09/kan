import { z } from "zod";
import { and, desc, eq, sql, isNull } from "drizzle-orm";

import { boards, cards, lists } from "~/server/db/schema";
import { generateUID } from "~/utils/generateUID";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const listRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        boardPublicId: z.string().min(12)
      }),
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.transaction(async (tx) => {
        const board = await tx.query.boards.findFirst({
          where: eq(boards.publicId, input.boardPublicId),
          columns: {
            id: true
          }
        });

        if (!board) return;

        const latestList = await tx.query.lists.findFirst({
          where: eq(lists.boardId, board.id),
          columns: {
            index: true
          },
          orderBy: desc(lists.index)
        });

        return tx.insert(lists).values({
          publicId: generateUID(),
          name: input.name,
          createdBy: userId,
          boardId: board.id,
          index: latestList ? latestList.index + 1 : 0
        });
      })
    }),
  reorder: publicProcedure
    .input(
      z.object({ 
        boardId: z.string().min(12),
        listId: z.string().min(12),
        currentIndex: z.number(),
        newIndex: z.number(),
      }))
    .mutation(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.transaction(async (tx) => {
        const [list] = await tx.select({ id: lists.id, boardId: lists.boardId }).from(lists).where(eq(lists.publicId, input.listId))

        if (!list) return;

        await tx.execute(sql`
          UPDATE ${lists}
          SET index =
            CASE
              WHEN ${lists.index} = ${input.currentIndex} AND ${lists.id} = ${list.id} THEN ${input.newIndex}
              WHEN ${input.currentIndex} < ${input.newIndex} AND ${lists.index} > ${input.currentIndex} AND ${lists.index} <= ${input.newIndex} THEN ${lists.index} - 1
              WHEN ${input.currentIndex} > ${input.newIndex} AND ${lists.index} >= ${input.newIndex} AND ${lists.index} < ${input.currentIndex} THEN ${lists.index} + 1
              ELSE ${lists.index}
            END
          WHERE ${lists.boardId} = ${list.boardId};
        `);
      })
    }),
  delete: publicProcedure
    .input(
      z.object({ 
        listPublicId: z.string().min(12),
      }))
    .mutation(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.transaction(async (tx) => {
        const list = await tx.query.lists.findFirst({
          where: eq(lists.publicId, input.listPublicId),
        })

        if (!list) return;

        await tx.update(lists).set({ deletedAt: new Date(), deletedBy: userId}).where(eq(lists.id, list.id));

        await tx.update(cards).set({ deletedAt: new Date(), deletedBy: userId}).where(eq(cards.listId, list.id));

        await tx.execute(sql`UPDATE ${lists} SET ${lists.index} = ${lists.index} - 1 WHERE ${lists.boardId} = ${list.boardId} AND ${lists.index} > ${list.index} AND ${lists.deletedAt} IS NULL;`);
      })
    }),
  update: publicProcedure
    .input(
      z.object({ 
        listPublicId: z.string().min(12),
        name: z.string().min(1),
      }))
    .mutation(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.update(lists).set({ name: input.name }).where(and(eq(lists.publicId, input.listPublicId), isNull(lists.deletedAt)));
    }),
});