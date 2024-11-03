import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

export const workspaceRouter = createTRPCRouter({
  all: protectedProcedure
    .meta({
      openapi: {
        summary: "Get all workspaces",
        method: "GET",
        path: "/workspaces",
        description: "Retrieves all workspaces for the authenticated user",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.custom<Awaited<ReturnType<typeof workspaceRepo.getAllByUserId>>>(),
    )
    .query(async ({ ctx }) => {
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
    .meta({
      openapi: {
        summary: "Get a workspace by public ID",
        method: "GET",
        path: "/workspaces/{workspacePublicId}",
        description: "Retrieves a workspace by its public ID",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(z.object({ workspacePublicId: z.string().min(12) }))
    .output(
      z.custom<
        Awaited<ReturnType<typeof workspaceRepo.getByPublicIdWithMembers>>
      >(),
    )
    .query(async ({ ctx, input }) => {
      const result = await workspaceRepo.getByPublicIdWithMembers(
        ctx.db,
        input.workspacePublicId,
      );

      if (!result)
        throw new TRPCError({
          message: `Workspace not found`,
          code: "NOT_FOUND",
        });

      return result;
    }),
  create: protectedProcedure
    .meta({
      openapi: {
        summary: "Create a workspace",
        method: "POST",
        path: "/workspaces",
        description: "Creates a new workspace",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof workspaceRepo.create>>>())
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
  update: protectedProcedure
    .meta({
      openapi: {
        summary: "Update a workspace",
        method: "PUT",
        path: "/workspaces/{workspacePublicId}",
        description: "Updates a workspace by its public ID",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(
      z.object({
        workspacePublicId: z.string().min(12),
        name: z.string().min(3).max(24),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof workspaceRepo.update>>>())
    .mutation(async ({ ctx, input }) => {
      const result = await workspaceRepo.update(
        ctx.db,
        input.workspacePublicId,
        input.name,
      );

      return result;
    }),
  delete: protectedProcedure
    .meta({
      openapi: {
        summary: "Delete a workspace",
        method: "DELETE",
        path: "/workspaces/{workspacePublicId}",
        description: "Deletes a workspace by its public ID",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(z.object({ workspacePublicId: z.string().min(12) }))
    .output(z.custom<Awaited<ReturnType<typeof workspaceRepo.hardDelete>>>())
    .mutation(async ({ ctx, input }) => {
      const result = await workspaceRepo.hardDelete(
        ctx.db,
        input.workspacePublicId,
      );

      if (!result)
        throw new TRPCError({
          message: `Unable to delete workspace`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
});
