import { authRouter } from "./routers/auth";
import { boardRouter } from "./routers/board";
import { cardRouter } from "./routers/card";
import { feedbackRouter } from "./routers/feedback";
import { importRouter } from "./routers/import";
import { labelRouter } from "./routers/label";
import { listRouter } from "./routers/list";
import { memberRouter } from "./routers/member";
import { userRouter } from "./routers/user";
import { workspaceRouter } from "./routers/workspace";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  board: boardRouter,
  card: cardRouter,
  feedback: feedbackRouter,
  label: labelRouter,
  list: listRouter,
  member: memberRouter,
  import: importRouter,
  user: userRouter,
  workspace: workspaceRouter,
});

export type AppRouter = typeof appRouter;
