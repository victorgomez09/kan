import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";

import { cards, cardsToLabels, labels } from "~/server/db/schema";
import { generateUID } from "~/utils/generateUID";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const labelRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(36),
        cardPublicId: z.string().min(12),
        colourCode: z.string().length(7),
      }),
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.transaction(async (tx) => {
        const card = await tx.query.cards.findFirst({
          where: and(eq(cards.publicId, input.cardPublicId), isNull(cards.deletedAt)),
          with: {
            list: {
              with: {
                board: true
              }
            }
          }
        });

        if (!card) return;

        const newLabel = await tx.insert(labels).values({
          publicId: generateUID(),
          name: input.name,
          colourCode: input.colourCode,
          createdBy: userId,
          boardId: card.list.boardId,
        });

        return tx.insert(cardsToLabels).values({
          cardId: card.id,
          labelId: Number(newLabel.insertId),
        });
      })
    }),
});