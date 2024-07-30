import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as boardRepo from "~/server/db/repository/board.repo";
import * as cardRepo from "~/server/db/repository/card.repo";
import * as listRepo from "~/server/db/repository/list.repo";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

export const boardRouter = createTRPCRouter({
  all: protectedProcedure
    .input(z.object({ workspacePublicId: z.string().min(12) }))
    .query(async ({ ctx, input }) => {
      const workspace = await workspaceRepo.getByPublicId(
        ctx.db,
        input.workspacePublicId,
      );

      if (!workspace)
        throw new TRPCError({
          message: `Workspace with public ID ${input.workspacePublicId} not found`,
          code: "NOT_FOUND",
        });

      const result = boardRepo.getAllByWorkspaceId(ctx.db, workspace.id);

      return result;
    }),
  byId: protectedProcedure
    .input(z.object({ boardPublicId: z.string().min(12) }))
    .query(async ({ ctx, input }) => {
      const result = await boardRepo.getByPublicId(ctx.db, input.boardPublicId);

      return result;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        workspacePublicId: z.string().min(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const workspace = await workspaceRepo.getByPublicId(
        ctx.db,
        input.workspacePublicId,
      );

      if (!workspace)
        throw new TRPCError({
          message: `Workspace with public ID ${input.workspacePublicId} not found`,
          code: "NOT_FOUND",
        });

      const result = await boardRepo.create(ctx.db, {
        name: input.name,
        createdBy: userId,
        workspaceId: workspace.id,
      });

      return result;
    }),
  update: protectedProcedure
    .input(
      z.object({
        boardPublicId: z.string().min(12),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await boardRepo.update(ctx.db, {
        name: input.name,
        boardPublicId: input.boardPublicId,
      });

      return result;
    }),
  delete: protectedProcedure
    .input(
      z.object({
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

      const board = await boardRepo.getWithListIdsByPublicId(
        ctx.db,
        input.boardPublicId,
      );

      if (!board)
        throw new TRPCError({
          message: `Board with public ID ${input.boardPublicId} not found`,
          code: "NOT_FOUND",
        });

      const listIds = board.lists.map((list) => list.id);

      const deletedAt = new Date().toISOString();

      await boardRepo.destroy(ctx.db, {
        boardId: board.id,
        deletedAt,
        deletedBy: userId,
      });

      if (listIds.length) {
        await listRepo.destroyAllByBoardId(ctx.db, {
          boardId: board.id,
          deletedAt,
          deletedBy: userId,
        });

        await cardRepo.destroyAllByListIds(ctx.db, {
          listIds,
          deletedAt,
          deletedBy: userId,
        });
      }
    }),
});
