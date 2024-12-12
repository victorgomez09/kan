import { TRPCError } from "@trpc/server";
import { z } from "zod";

import * as cardRepo from "@kan/db/repository/card.repo";
import * as labelRepo from "@kan/db/repository/label.repo";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const labelRouter = createTRPCRouter({
  byPublicId: protectedProcedure
    .meta({
      openapi: {
        summary: "Get a label by public ID",
        method: "GET",
        path: "/labels/{labelPublicId}",
        description: "Retrieves a label by its public ID",
        tags: ["Labels"],
        protect: true,
      },
    })
    .input(z.object({ labelPublicId: z.string().min(12) }))
    .output(z.custom<Awaited<ReturnType<typeof labelRepo.getByPublicId>>>())
    .query(async ({ ctx, input }) => {
      const label = await labelRepo.getByPublicId(ctx.db, input.labelPublicId);

      if (!label)
        throw new TRPCError({
          message: `Label with public ID ${input.labelPublicId} not found`,
          code: "NOT_FOUND",
        });

      return label;
    }),
  create: protectedProcedure
    .meta({
      openapi: {
        summary: "Create a label",
        method: "POST",
        path: "/labels",
        description: "Creates a new label",
        tags: ["Labels"],
        protect: true,
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
        path: "/labels/{labelPublicId}",
        description: "Updates a label by its public ID",
        tags: ["Labels"],
        protect: true,
      },
    })
    .input(
      z.object({
        labelPublicId: z.string().min(12),
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
        path: "/labels/{labelPublicId}",
        description: "Deletes a label by its public ID",
        tags: ["Labels"],
        protect: true,
      },
    })
    .input(z.object({ labelPublicId: z.string().min(12) }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const label = await labelRepo.getByPublicId(ctx.db, input.labelPublicId);

      if (!label)
        throw new TRPCError({
          message: `Label with public ID ${input.labelPublicId} not found`,
          code: "NOT_FOUND",
        });

      await cardRepo.hardDeleteAllCardLabelRelationships(ctx.db, label.id);

      await labelRepo.hardDelete(ctx.db, label.id);

      return { success: true };
    }),
});
