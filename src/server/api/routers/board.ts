import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const boardRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user.id;

    if (!userId) return;

    return ctx.db.query.boards.findMany();
  })
});
