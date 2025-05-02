import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { OpenApiMeta } from "trpc-to-openapi";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { dbClient } from "@kan/db/client";
import { auth } from "@kan/auth";
import { createDrizzleClient } from "@kan/db/client";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
  stripeCustomerId?: string | null | undefined;
}

interface CreateContextOptions {
  user: User | null | undefined;
  db: dbClient;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    db: opts.db,
  };
};

export const createTRPCContext = async ({
  req,
}: FetchCreateContextFnOptions) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const db = createDrizzleClient();

  return createInnerTRPCContext({ db, user: session?.user });
};

export const createRESTContext = async ({ req }: CreateNextContextOptions) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const db = createDrizzleClient();

  if (!accessToken) {
    return createInnerTRPCContext({ db, user: null });
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return createInnerTRPCContext({ db, user: session?.user });
};

const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure.meta({
  openapi: { method: "GET", path: "/public" },
});

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx,
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed).meta({
  openapi: {
    method: "GET",
    path: "/protected",
  },
});
