import { z } from "zod";
import { eq, asc } from "drizzle-orm";

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
            columns: {
              publicId: true,
              name: true,
              boardId: true,
              index: true,
            },
            with: {
              cards: {
                orderBy: [asc(cards.index)],
                columns: {
                  publicId: true,
                  title: true,
                  description: true,
                  listId: true,
                  index: true,
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
});
