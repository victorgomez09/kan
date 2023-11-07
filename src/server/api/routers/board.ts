import { z } from "zod";
import { eq } from "drizzle-orm";

import { boards } from "~/server/db/schema";
import { generateUID } from "~/utils/generateUID";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const boardRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) return;

    const boards = await ctx.db.query.boards.findMany();

    return boards.map((board) => ({ ...board, id: board.publicId }))
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string().min(12) }))
    .query(({ ctx, input }) => 
      ctx.db.query.boards.findFirst({
        where: eq(boards.publicId, input.id),
        with: {
          lists: {
            with: {
              cards: true,
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
