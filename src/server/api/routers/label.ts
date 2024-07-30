import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as cardRepo from "~/server/db/repository/card.repo";
import * as labelRepo from "~/server/db/repository/label.repo";

export const labelRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(36),
        cardPublicId: z.string().min(12),
        colourCode: z.string().length(7),
      }),
    )
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

      return result;
    }),
});
