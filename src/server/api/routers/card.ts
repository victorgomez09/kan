import { z } from "zod";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { cards, lists } from "~/server/db/schema";
import { generateUID } from "~/utils/generateUID";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const cardRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        listPublicId: z.string().min(12),
      }),
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.transaction(async (tx) => {
        const list = await tx.query.lists.findFirst({
          where: eq(lists.publicId, input.listPublicId),
          columns: {
            id: true
          }
        });

        if (!list) return;

        const latestCard = await tx.query.cards.findFirst({
          where: and(eq(cards.listId, list.id), isNull(cards.deletedAt)),
          columns: {
            index: true
          },
          orderBy: desc(cards.index)
        });

        return tx.insert(cards).values({
          publicId: generateUID(),
          title: input.title,
          createdBy: userId,
          listId: list.id,
          index: latestCard ? latestCard.index + 1 : 0
        });
      })
    }),
    byId: publicProcedure
      .input(z.object({ id: z.string().min(12) }))
      .query(({ ctx, input }) => 
        ctx.db.query.cards.findFirst({
          with: {
            list: {
              columns: {
                publicId: true,
              },
              with: {
                board: {
                  columns: {
                    publicId: true,
                  },
                }
              }
            },
          },
          where: and(eq(cards.publicId, input.id), isNull(cards.deletedAt)),
        })
      ),
    update: publicProcedure
      .input(
        z.object({ 
          cardId: z.string().min(12),
          title: z.string().min(1),
          description: z.string(),
        }))
      .mutation(({ ctx, input }) => {
        const userId = ctx.session?.user.id;

        if (!userId) return;

        return ctx.db.update(cards).set({ title: input.title, description: input.description }).where(and(eq(cards.publicId, input.cardId), isNull(cards.deletedAt)));
      }),
    delete: publicProcedure
      .input(
        z.object({ 
          cardPublicId: z.string().min(12),
        }))
      .mutation(({ ctx, input }) => {
        const userId = ctx.session?.user.id;

        if (!userId) return;

        return ctx.db.transaction(async (tx) => {
          const card = await tx.query.cards.findFirst({
            where: eq(cards.publicId, input.cardPublicId),
          })

          if (!card) return;

          await tx.update(cards).set({ deletedAt: new Date(), deletedBy: userId}).where(eq(cards.publicId, input.cardPublicId));

          await tx.execute(sql`UPDATE ${cards} SET ${cards.index} = ${cards.index} - 1 WHERE ${cards.listId} = ${card.listId} AND ${cards.index} > ${card.index} AND ${cards.deletedAt} IS NULL;`);
        })
      }),
    reorder: publicProcedure
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
          const [currentList] = await tx.select({ id: lists.id }).from(lists).where(and(eq(lists.publicId, input.currentListId), isNull(cards.deletedAt)))
          const [newList] = await tx.select({ id: lists.id }).from(lists).where(and(eq(lists.publicId, input.newListId), isNull(cards.deletedAt)))

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
              WHERE ${cards.listId} = ${currentList.id} AND ${cards.deletedAt} IS NULL;
            `);
          } else {
            await tx.execute(sql`UPDATE ${cards} SET ${cards.index} = ${cards.index} + 1 WHERE ${cards.listId} = ${newList.id} AND ${cards.index} >= ${input.newIndex} AND ${cards.deletedAt} IS NULL;`)

            await tx.execute(sql`UPDATE ${cards} SET ${cards.index} = ${cards.index} - 1 WHERE ${cards.listId} = ${currentList.id} AND ${cards.index} >= ${input.currentIndex} AND ${cards.deletedAt} IS NULL;`)

            await tx
              .update(cards)
              .set({ listId: newList.id, index: input.newIndex })
              .where(and(eq(cards.publicId, input.cardId), isNull(cards.deletedAt)));
          }
        })
      })
});