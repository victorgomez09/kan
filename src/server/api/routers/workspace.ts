import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";

import { workspaces, workspaceMembers } from "~/server/db/schema";

import { generateUID } from "~/utils/generateUID";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const workspaceRouter = createTRPCRouter({
  all: publicProcedure
    .query(({ ctx }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.query.workspaceMembers.findMany({
        where: and(eq(workspaceMembers.userId, userId), isNull(workspaceMembers.deletedAt)),
        columns: {
          role: true,
        },
        with: {
          workspace: {
            columns: {
              publicId: true,
              name: true
            }
          }
        }
      });
    }),
  byId: publicProcedure
    .input(z.object({ publicId: z.string().min(12) }))
    .query(({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      return ctx.db.query.workspaces.findFirst({
        where: and(eq(workspaces.publicId, input.publicId), isNull(workspaces.deletedAt)),
        columns: {
          publicId: true,
        },
        with: {
          members: {
            columns: {
              publicId: true,
              role: true,
            },
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          }
        }
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId) return;

      const workspace = await ctx.db.insert(workspaces).values({
        publicId: generateUID(),
        name: input.name,
        slug: input.name.toLowerCase(),
        createdBy: userId,
      }).returning({ id: workspaces.id });

      const workspaceId = workspace[0]?.id;

      if (!workspaceId) return;

      await ctx.db.insert(workspaceMembers).values({
        publicId: generateUID(),
        userId,
        workspaceId: workspaceId,
        createdBy: userId,
        role: 'admin'
      })

      return ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        columns: {
          publicId: true,
          name: true,
        },
      });
    }),
});