import { z } from "zod";
import { and, eq, asc, isNull, inArray } from "drizzle-orm";

import { boards, cards, lists, workspaces } from "~/server/db/schema";
import { generateUID } from "~/utils/generateUID";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const boardRouter = createTRPCRouter({
  all: publicProcedure
    .input(z.object({ workspacePublicId: z.string().min(12) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      // @todo: validate user has access to workspace

      if (!userId) return;

      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.publicId, input.workspacePublicId),
      })

      if (!workspace) return;

      return ctx.db.query.boards.findMany({
        where: and(eq(boards.workspaceId, workspace.id), isNull(boards.deletedAt)),
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
        where: and(eq(boards.publicId, input.id), isNull(boards.deletedAt)),
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
    delete: publicProcedure
      .input(
        z.object({ 
          boardPublicId: z.string().min(12),
        }))
      .mutation(({ ctx, input }) => {
        const userId = ctx.session?.user.id;
  
        if (!userId) return;
  
        return ctx.db.transaction(async (tx) => {
          const board = await tx.query.boards.findFirst({
            where: eq(boards.publicId, input.boardPublicId),
            with: {
              lists: true,
            }
          })
  
          if (!board) return;

          const listIds = board.lists.map((list) => list.id)
  
          await tx.update(boards).set({ deletedAt: new Date(), deletedBy: userId }).where(eq(boards.id, board.id));

          if (listIds.length) {
            await tx.update(lists).set({ deletedAt: new Date(), deletedBy: userId }).where(eq(lists.boardId, board.id));
            await tx.update(cards).set({ deletedAt: new Date(), deletedBy: userId }).where(inArray(cards.listId, listIds));
          }
        })
      }),
});
