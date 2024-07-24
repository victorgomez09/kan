import { z } from "zod";
import { generateUID } from "~/utils/generateUID";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

export const workspaceRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;

    if (!userId) return;

    const result = await workspaceRepo.getAllByUserId(ctx.db, userId);

    return result;
  }),
  byId: protectedProcedure
    .input(z.object({ publicId: z.string().min(12) }))
    .query(async ({ ctx, input }) => {
      const result = await workspaceRepo.getByPublicIdWithMembers(
        ctx.db,
        input.publicId,
      );

      return result;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) return;

      const result = await workspaceRepo.create(ctx.db, {
        name: input.name,
        slug: input.name,
        createdBy: userId,
      });

      return result;
    }),
});
