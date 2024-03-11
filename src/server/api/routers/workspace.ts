import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";

import { workspaces, workspaceMembers } from "~/server/db/schema";

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
});