import { z } from "zod";
import { eq, asc, isNull } from "drizzle-orm";

import { boards, cards, lists } from "~/server/db/schema";
import { generateUID } from "~/utils/generateUID";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const boardRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) return;

    return ctx.db.query.boards.findMany({
      where: eq(boards.createdBy, userId),
      columns: {
        publicId: true,
        name: true,
      },
    });
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string().min(12) }))
    .query(({ ctx, input }) => 
      ctx.db.query.boards.findFirst({
        where: eq(boards.publicId, input.id),
        columns: {
          publicId: true,
          name: true,
        },
        with: {
          lists: {
            orderBy: [asc(lists.index)],
            where: isNull(cards.deletedAt),
            columns: {
              publicId: true,
              name: true,
              boardId: true,
              index: true,
            },
            with: {
              cards: {
                where: isNull(cards.deletedAt),
                orderBy: [asc(cards.index)],
                columns: {
                  publicId: true,
                  title: true,
                  description: true,
                  listId: true,
                  index: true,
                },
                with: {
                  labels: {
                    columns: {
                      labelId: false,
                      cardId: false,
                    },
                    with: {
                      label: {
                        columns: {
                          publicId: true,
                          name: true,
                          colourCode: true,
                        }
                      }
                    }
                  }
                }
              }
            },
          },
        },
      })
    ),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.insert(boards).values({
        publicId: generateUID(),
        name: input.name,
        createdBy: userId,
      });
    }),
    update: publicProcedure
      .input(
        z.object({ 
          boardId: z.string().min(12),
          name: z.string().min(1),
        }))
      .mutation(({ ctx, input }) => {
        const userId = ctx.session?.user.id;

        if (!userId) return;

        return ctx.db.update(boards).set({ name: input.name }).where(eq(boards.publicId, input.boardId));
      }),
});
