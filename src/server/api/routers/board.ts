import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as boardRepo from "~/server/db/repository/board.repo";
import * as cardRepo from "~/server/db/repository/card.repo";
import * as listRepo from "~/server/db/repository/list.repo";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

export const boardRouter = createTRPCRouter({
  all: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/board/{workspacePublicId}",
        summary: "Get all boards",
      },
    })
    .input(z.object({ workspacePublicId: z.string().min(12) }))
    .output(
      z.custom<Awaited<ReturnType<typeof boardRepo.getAllByWorkspaceId>>>(),
    )
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
    .meta({
      openapi: {
        method: "GET",
        path: "/board/{boardPublicId}",
        summary: "Get board by public ID",
      },
    })
    .input(
      z.object({
        boardPublicId: z.string().min(12),
        members: z.array(z.string().min(12)),
        labels: z.array(z.string().min(12)),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof boardRepo.getByPublicId>>>())
    .query(async ({ ctx, input }) => {
      const result = await boardRepo.getByPublicId(
        ctx.db,
        input.boardPublicId,
        {
          members: input.members,
          labels: input.labels,
        },
      );

      return result;
    }),
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/board",
        summary: "Create board",
      },
    })
    .input(
      z.object({
        name: z.string().min(1),
        workspacePublicId: z.string().min(12),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof boardRepo.create>>>())
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

      if (!result)
        throw new TRPCError({
          message: `Failed to create board`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
  update: protectedProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/board/{boardPublicId}",
        summary: "Update board",
      },
    })
    .input(
      z.object({
        boardPublicId: z.string().min(12),
        name: z.string().min(1),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof boardRepo.update>>>())
    .mutation(async ({ ctx, input }) => {
      const result = await boardRepo.update(ctx.db, {
        name: input.name,
        boardPublicId: input.boardPublicId,
      });

      if (!result)
        throw new TRPCError({
          message: `Failed to update board`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/board/{boardPublicId}",
        summary: "Delete board",
      },
    })
    .input(
      z.object({
        boardPublicId: z.string().min(12),
      }),
    )
    .output(z.object({ success: z.boolean() }))
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

      await boardRepo.softDelete(ctx.db, {
        boardId: board.id,
        deletedAt,
        deletedBy: userId,
      });

      if (listIds.length) {
        await listRepo.softDeleteAllByBoardId(ctx.db, {
          boardId: board.id,
          deletedAt,
          deletedBy: userId,
        });

        await cardRepo.softDeleteAllByListIds(ctx.db, {
          listIds,
          deletedAt,
          deletedBy: userId,
        });
      }

      return { success: true };
    }),
});
