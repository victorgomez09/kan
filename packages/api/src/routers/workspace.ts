import { TRPCError } from "@trpc/server";
import { z } from "zod";

import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import * as workspaceSlugRepo from "@kan/db/repository/workspaceSlug.repo";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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
  bySlug: publicProcedure
    .meta({
      openapi: {
        summary: "Get a workspace by slug",
        method: "GET",
        path: "/workspaces/{workspaceSlug}",
        description: "Retrieves a workspace by its slug",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(
      z.object({
        workspaceSlug: z
          .string()
          .min(3)
          .max(24)
          .regex(/^(?![-]+$)[a-zA-Z0-9-]+$/),
      }),
    )
    .output(
      z.custom<Awaited<ReturnType<typeof workspaceRepo.getBySlugWithBoards>>>(),
    )
    .query(async ({ ctx, input }) => {
      const result = await workspaceRepo.getBySlugWithBoards(
        ctx.db,
        input.workspaceSlug,
      );

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

      if (!result.publicId)
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
        name: z.string().min(3).max(24).optional(),
        slug: z
          .string()
          .min(3)
          .max(24)
          .regex(/^(?![-]+$)[a-zA-Z0-9-]+$/)
          .optional(),
        description: z.string().min(3).max(280).optional(),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof workspaceRepo.update>>>())
    .mutation(async ({ ctx, input }) => {
      if (input.slug) {
        const workspace = await workspaceRepo.getByPublicId(
          ctx.db,
          input.workspacePublicId,
        );

        const reservedOrPremiumWorkspaceSlug =
          await workspaceSlugRepo.getWorkspaceSlug(ctx.db, input.slug);

        const isWorkspaceSlugAvailable =
          await workspaceRepo.isWorkspaceSlugAvailable(ctx.db, input.slug);

        if (
          reservedOrPremiumWorkspaceSlug?.type === "reserved" ||
          (workspace?.plan !== "pro" &&
            reservedOrPremiumWorkspaceSlug?.type === "premium") ||
          !isWorkspaceSlugAvailable
        ) {
          throw new TRPCError({
            message: `Workspace slug already taken`,
            code: "CONFLICT",
          });
        }
      }

      const result = await workspaceRepo.update(
        ctx.db,
        input.workspacePublicId,
        {
          name: input.name,
          slug: input.slug,
          description: input.description,
        },
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
  checkSlugAvailability: publicProcedure
    .meta({
      openapi: {
        summary: "Check if a workspace slug is available",
        method: "GET",
        path: "/workspaces/check-slug-availability",
        description: "Checks if a workspace slug is available",
        tags: ["Workspaces"],
        protect: true,
      },
    })
    .input(
      z.object({
        workspaceSlug: z
          .string()
          .min(3)
          .max(24)
          .regex(/^(?![-]+$)[a-zA-Z0-9-]+$/),
      }),
    )
    .output(
      z.object({
        isAvailable: z.boolean(),
        isReserved: z.boolean(),
        isPremium: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const slug = input.workspaceSlug.toLowerCase();
      // check list of reserved or premium slugs
      const workspaceSlug = await workspaceSlugRepo.getWorkspaceSlug(
        ctx.db,
        slug,
      );

      // check slug is not taken already
      const isWorkspaceSlugAvailable =
        await workspaceRepo.isWorkspaceSlugAvailable(ctx.db, slug);

      return {
        isAvailable:
          isWorkspaceSlugAvailable && workspaceSlug?.type !== "reserved",
        isReserved: workspaceSlug?.type === "reserved",
        isPremium: workspaceSlug?.type === "premium",
      };
    }),
});
