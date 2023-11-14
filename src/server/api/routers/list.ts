import { z } from "zod";
import { eq, sql } from "drizzle-orm";

import { lists } from "~/server/db/schema";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const listRouter = createTRPCRouter({
  update: publicProcedure
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
          SET ${lists.index} =
            CASE
              WHEN ${lists.index} = ${input.currentIndex} AND ${lists.id} = ${list.id} THEN ${input.newIndex}
              WHEN ${input.currentIndex} < ${input.newIndex} AND ${lists.index} > ${input.currentIndex} AND ${lists.index} <= ${input.newIndex} THEN ${lists.index} - 1
              WHEN ${input.currentIndex} > ${input.newIndex} AND ${lists.index} >= ${input.newIndex} AND ${lists.index} < ${input.currentIndex} THEN ${lists.index} + 1
              ELSE ${lists.index}
            END
          WHERE ${lists.boardId} = ${list.boardId};
        `);
      })

      
    })
});