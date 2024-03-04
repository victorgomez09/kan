import { and, eq, isNull } from "drizzle-orm";

import { workspaceMembers } from "~/server/db/schema";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const workspaceRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
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
});