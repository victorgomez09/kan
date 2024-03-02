import { and, eq, isNull } from "drizzle-orm";

import { workspaces } from "~/server/db/schema";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const workspaceRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) return;

    return ctx.db.query.workspaces.findMany({
      where: and(eq(workspaces.createdBy, userId), isNull(workspaces.deletedAt)),
      columns: {
        publicId: true,
        name: true,
      },
    });
  }),
});