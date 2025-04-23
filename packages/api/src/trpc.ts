import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { OpenApiMeta } from "trpc-to-openapi";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { dbClient } from "@kan/db/client";
import type { Database } from "@kan/db/types/database.types";
import type { SupabaseClient } from "@kan/supabase";
import { createDrizzleClient } from "@kan/db/client";
import { createNextApiClient, createTRPCClient } from "@kan/supabase";

export interface User {
  id: string;
}

interface CreateContextOptions {
  user: User | null;
  db: SupabaseClient<Database>;
  drizzleDb: dbClient;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    db: opts.db,
    drizzleDb: opts.drizzleDb,
  };
};

export const createTRPCContext = async ({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) => {
  const db = createTRPCClient(req, resHeaders);

  const {
    data: { user },
  } = await db.auth.getUser();

  const drizzleDb = createDrizzleClient();

  return createInnerTRPCContext({ db, user, drizzleDb });
};

export const createRESTContext = async ({ req }: CreateNextContextOptions) => {
  const db = createNextApiClient(req);

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const drizzleDb = createDrizzleClient();

  if (!accessToken) {
    return createInnerTRPCContext({ db, user: null, drizzleDb });
  }

  const {
    data: { user },
  } = await db.auth.getUser(accessToken);

  return createInnerTRPCContext({ db, user, drizzleDb });
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
