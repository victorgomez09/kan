import { TRPCError } from "@trpc/server";
import { z } from "zod";

import * as boardRepo from "@kan/db/repository/board.repo";
import * as cardRepo from "@kan/db/repository/card.repo";
import * as activityRepo from "@kan/db/repository/cardActivity.repo";
import * as listRepo from "@kan/db/repository/list.repo";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({
      openapi: {
        summary: "Create a list",
        method: "POST",
        path: "/lists",
        description: "Creates a new list for a given board",
        tags: ["Lists"],
        protect: true,
      },
    })
    .input(
      z.object({
        name: z.string().min(1),
        boardPublicId: z.string().min(12),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof listRepo.create>>>())
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
        index:
          (latestListIndex ?? latestListIndex === 0) ? latestListIndex + 1 : 0,
      });

      if (!result)
        throw new TRPCError({
          message: `Failed to create list`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
  reorder: protectedProcedure
    .meta({
      openapi: {
        summary: "Reorder a list",
        method: "POST",
        path: "/lists/{listPublicId}/reorder",
        description: "Reorders the position of a list",
        tags: ["Lists"],
        protect: true,
      },
    })
    .input(
      z.object({
        listPublicId: z.string().min(12),
        currentIndex: z.number(),
        newIndex: z.number(),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof listRepo.reorder>>>())
    .mutation(async ({ ctx, input }) => {
      const list = await listRepo.getByPublicId(ctx.db, input.listPublicId);

      if (!list)
        throw new TRPCError({
          message: `List with public ID ${input.listPublicId} not found`,
          code: "NOT_FOUND",
        });

      const result = await listRepo.reorder(ctx.db, {
        boardPublicId: list.boardId,
        listPublicId: list.id,
        currentIndex: input.currentIndex,
        newIndex: input.newIndex,
      });

      if (!result)
        throw new TRPCError({
          message: `Failed to reorder list`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
  delete: protectedProcedure
    .meta({
      openapi: {
        summary: "Delete a list",
        method: "DELETE",
        path: "/lists/{listPublicId}",
        description: "Deletes a list by its public ID",
        tags: ["Lists"],
        protect: true,
      },
    })
    .input(
      z.object({
        listPublicId: z.string().min(12),
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

      const list = await listRepo.getByPublicId(ctx.db, input.listPublicId);

      if (!list)
        throw new TRPCError({
          message: `List with public ID ${input.listPublicId} not found`,
          code: "NOT_FOUND",
        });

      const deletedAt = new Date().toISOString();

      const deletedList = await listRepo.softDeleteById(ctx.db, {
        listId: list.id,
        deletedAt,
        deletedBy: userId,
      });

      if (!deletedList)
        throw new TRPCError({
          message: `Failed to delete list`,
          code: "INTERNAL_SERVER_ERROR",
        });

      const deletedCards = await cardRepo.softDeleteAllByListIds(ctx.db, {
        listIds: [list.id],
        deletedAt,
        deletedBy: userId,
      });

      if (!Array.isArray(deletedCards))
        throw new TRPCError({
          message: `Failed to delete cards`,
          code: "INTERNAL_SERVER_ERROR",
        });

      const activities = deletedCards.map((card) => ({
        type: "card.archived" as const,
        createdBy: userId,
        cardId: card.id,
      }));

      await activityRepo.bulkCreate(ctx.db, activities);

      await listRepo.shiftIndex(ctx.db, {
        boardId: list.boardId,
        listIndex: list.index,
      });

      return { success: true };
    }),
  update: protectedProcedure
    .meta({
      openapi: {
        summary: "Update a list",
        method: "PUT",
        path: "/lists/{listPublicId}",
        description: "Updates a list by its public ID",
        tags: ["Lists"],
        protect: true,
      },
    })
    .input(
      z.object({
        listPublicId: z.string().min(12),
        name: z.string().min(1),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof listRepo.update>>>())
    .mutation(async ({ ctx, input }) => {
      const result = await listRepo.update(
        ctx.db,
        { name: input.name },
        { listPublicId: input.listPublicId },
      );

      if (!result)
        throw new TRPCError({
          message: `Failed to update list`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
});
