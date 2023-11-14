import { z } from "zod";
import { eq, sql } from "drizzle-orm";

import { cards, lists } from "~/server/db/schema";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const cardRouter = createTRPCRouter({
  update: publicProcedure
  .input(
    z.object({ 
      cardId: z.string().min(12),
      currentListId: z.string().min(12),
      newListId: z.string().min(12),
      currentIndex: z.number(),
      newIndex: z.number()
    }))
  .mutation(({ ctx, input }) => {
    const userId = ctx.session?.user.id;

    if (!userId) return;

    return ctx.db.transaction(async (tx) => {
      const [currentList] = await tx.select({ id: lists.id }).from(lists).where(eq(lists.publicId, input.currentListId))
      const [newList] = await tx.select({ id: lists.id }).from(lists).where(eq(lists.publicId, input.newListId))

      if (!currentList?.id || !newList?.id) return;

      if (currentList.id === newList.id) {
        await tx.execute(sql`
          UPDATE ${cards}
          SET ${cards.index} =
            CASE
              WHEN ${cards.index} = ${input.currentIndex} THEN ${input.newIndex}
              WHEN ${input.currentIndex} < ${input.newIndex} AND ${cards.index} > ${input.currentIndex} AND ${cards.index} <= ${input.newIndex} THEN ${cards.index} - 1
              WHEN ${input.currentIndex} > ${input.newIndex} AND ${cards.index} >= ${input.newIndex} AND ${cards.index} < ${input.currentIndex} THEN ${cards.index} + 1
              ELSE ${cards.index}
            END
          WHERE ${cards.listId} = ${currentList.id};
        `);
      } else {
        await tx.execute(sql`UPDATE ${cards} SET ${cards.index} = ${cards.index} + 1 WHERE ${cards.listId} = ${newList.id} AND ${cards.index} >= ${input.newIndex};`)

        await tx.execute(sql`UPDATE ${cards} SET ${cards.index} = ${cards.index} - 1 WHERE ${cards.listId} = ${currentList.id} AND ${cards.index} >= ${input.currentIndex};`)

        await tx
          .update(cards)
          .set({ listId: newList.id, index: input.newIndex })
          .where(eq(cards.publicId, input.cardId));
      }
    })
  })
});