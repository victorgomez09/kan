import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { OpenApiMeta } from "trpc-to-openapi";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { Database } from "@kan/db/types/database.types";
import type { SupabaseClient } from "@kan/supabase";
import {
  createNextApiClient,
  createTRPCAdminClient,
  createTRPCClient,
} from "@kan/supabase";

export interface User {
  id: string;
}

interface CreateContextOptions {
  user: User | null;
  db: SupabaseClient<Database>;
  adminDb: SupabaseClient<Database>;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    db: opts.db,
    adminDb: opts.adminDb,
  };
};

export const createTRPCContext = async ({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) => {
  const db = createTRPCClient(req, resHeaders);
  const adminDb = createTRPCAdminClient();

  const {
    data: { user },
  } = await db.auth.getUser();

  return createInnerTRPCContext({ db, adminDb, user });
};

export const createRESTContext = async ({ req }: CreateNextContextOptions) => {
  const db = createNextApiClient(req);
  const adminDb = createTRPCAdminClient();

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!accessToken) {
    return createInnerTRPCContext({ db, adminDb, user: null });
  }

  const {
    data: { user },
  } = await db.auth.getUser(accessToken);

  return createInnerTRPCContext({ db, adminDb, user });
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
