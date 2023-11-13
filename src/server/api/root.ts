import { boardRouter } from "~/server/api/routers/board";
import { cardRouter } from "~/server/api/routers/card";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  board: boardRouter,
  card: cardRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
