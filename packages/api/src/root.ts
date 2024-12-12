import { authRouter } from "./routers/auth";
import { boardRouter } from "./routers/board";
import { cardRouter } from "./routers/card";
import { importRouter } from "./routers/import";
import { labelRouter } from "./routers/label";
import { listRouter } from "./routers/list";
import { memberRouter } from "./routers/member";
import { workspaceRouter } from "./routers/workspace";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  board: boardRouter,
  card: cardRouter,
  label: labelRouter,
  list: listRouter,
  member: memberRouter,
  import: importRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
