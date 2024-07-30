import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as cardRepo from "~/server/db/repository/card.repo";
import * as boardRepo from "~/server/db/repository/board.repo";
import * as listRepo from "~/server/db/repository/list.repo";

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        boardPublicId: z.string().min(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const board = await boardRepo.getWithLatestListIndexByPublicId(
        ctx.db,
        input.boardPublicId,
      );

      if (!board)
        throw new TRPCError({
          message: `Board with public ID ${input.boardPublicId} not found`,
          code: "NOT_FOUND",
        });

      const latestListIndex = board.lists[0]?.index;

      const result = await listRepo.create(ctx.db, {
        name: input.name,
        createdBy: userId,
        boardId: board.id,
        index: latestListIndex ? latestListIndex + 1 : 0,
      });

      return result;
    }),
  reorder: protectedProcedure
    .input(
      z.object({
        boardId: z.string().min(12),
        listId: z.string().min(12),
        currentIndex: z.number(),
        newIndex: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await listRepo.getByPublicId(ctx.db, input.listId);

      if (!list)
        throw new TRPCError({
          message: `List with public ID ${input.listId} not found`,
          code: "NOT_FOUND",
        });

      const result = listRepo.reorder(ctx.db, {
        boardPublicId: list.boardId,
        listPublicId: list.id,
        currentIndex: input.currentIndex,
        newIndex: input.newIndex,
      });

      return result;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        listPublicId: z.string().min(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const list = await listRepo.getByPublicId(ctx.db, input.listPublicId);

      if (!list)
        throw new TRPCError({
          message: `List with public ID ${input.listPublicId} not found`,
          code: "NOT_FOUND",
        });

      const deletedAt = new Date().toISOString();

      await listRepo.destroyById(ctx.db, {
        listId: list.id,
        deletedAt,
        deletedBy: userId,
      });

      await cardRepo.destroyAllByListIds(ctx.db, {
        listIds: [list.id],
        deletedAt,
        deletedBy: userId,
      });

      await listRepo.shiftIndex(ctx.db, {
        boardId: list.boardId,
        listIndex: list.id,
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        listPublicId: z.string().min(12),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await listRepo.update(
        ctx.db,
        { name: input.name },
        { listPublicId: input.listPublicId },
      );

      return result;
    }),
});
