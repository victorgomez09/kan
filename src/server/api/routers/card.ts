import { z } from "zod";
import { and, eq, gte, or} from "drizzle-orm";

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
      const [currentList, newList] = await tx.select({ id: lists.id }).from(lists).where(or(eq(lists.publicId, input.currentListId), eq(lists.publicId, input.newListId)))


      if (!currentList?.id || !newList?.id) return;
      
      await tx
        .update(cards)
        .set({ index: input.newIndex + 1 })
        .where(and(eq(cards.listId, newList.id), gte(cards.index, input.newIndex)))

      await tx
        .update(cards)
        .set({ listId: newList.id, index: input.newIndex })
        .where(eq(cards.publicId, input.cardId))
    })
  }),
});