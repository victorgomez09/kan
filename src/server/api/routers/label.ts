import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as cardRepo from "~/server/db/repository/card.repo";
import * as labelRepo from "~/server/db/repository/label.repo";

export const labelRouter = createTRPCRouter({
  byPublicId: protectedProcedure
    .meta({
      openapi: {
        summary: "Get a label by public ID",
        method: "GET",
        path: "/{publicId}",
      },
    })
    .input(z.object({ publicId: z.string().min(12) }))
    .output(z.custom<Awaited<ReturnType<typeof labelRepo.getByPublicId>>>())
    .query(async ({ ctx, input }) => {
      const label = await labelRepo.getByPublicId(ctx.db, input.publicId);

      if (!label)
        throw new TRPCError({
          message: `Label with public ID ${input.publicId} not found`,
          code: "NOT_FOUND",
        });

      return label;
    }),
  create: protectedProcedure
    .meta({
      openapi: {
        summary: "Create a label",
        method: "POST",
        path: "/create",
      },
    })
    .input(
      z.object({
        name: z.string().min(1).max(36),
        cardPublicId: z.string().min(12),
        colourCode: z.string().length(7),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof labelRepo.create>>>())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const card = await cardRepo.getCardWithListByPublicId(
        ctx.db,
        input.cardPublicId,
      );

      if (!card?.list)
        throw new TRPCError({
          message: `Card with public ID ${input.cardPublicId} not found`,
          code: "NOT_FOUND",
        });

      const result = await labelRepo.create(ctx.db, {
        name: input.name,
        colourCode: input.colourCode,
        createdBy: userId,
        boardId: card.list.boardId,
      });

      if (!result)
        throw new TRPCError({
          message: `Failed to create label`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
  update: protectedProcedure
    .meta({
      openapi: {
        summary: "Update a label",
        method: "PUT",
        path: "/{publicId}",
      },
    })
    .input(
      z.object({
        publicId: z.string().min(12),
        name: z.string().min(1).max(36),
        colourCode: z.string().length(7),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof labelRepo.update>>>())
    .mutation(async ({ ctx, input }) => {
      const result = await labelRepo.update(ctx.db, input);

      return result;
    }),
  delete: protectedProcedure
    .meta({
      openapi: {
        summary: "Delete a label",
        method: "DELETE",
        path: "/{publicId}",
      },
    })
    .input(z.object({ publicId: z.string().min(12) }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const label = await labelRepo.getByPublicId(ctx.db, input.publicId);

      if (!label)
        throw new TRPCError({
          message: `Label with public ID ${input.publicId} not found`,
          code: "NOT_FOUND",
        });

      await cardRepo.hardDeleteAllCardLabelRelationships(ctx.db, label.id);

      await labelRepo.hardDelete(ctx.db, label.id);

      return { success: true };
    }),
});
