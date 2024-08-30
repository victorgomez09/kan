import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

export const workspaceRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;

    if (!userId)
      throw new TRPCError({
        message: `User not authenticated`,
        code: "UNAUTHORIZED",
      });

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

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const result = await workspaceRepo.create(ctx.db, {
        name: input.name,
        slug: input.name,
        createdBy: userId,
      });

      if (!result?.publicId)
        throw new TRPCError({
          message: `Unable to create workspace`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ workspacePublicId: z.string().min(12) }))
    .mutation(async ({ ctx, input }) => {
      const { data } = await workspaceRepo.hardDelete(
        ctx.db,
        input.workspacePublicId,
      );

      return data;
    }),
});
