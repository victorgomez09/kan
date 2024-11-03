import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { env } from "~/env.mjs";

import * as userRepo from "~/server/db/repository/user.repo";

export const authRouter = createTRPCRouter({
  getUser: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/users/me",
        summary: "Get user",
        description:
          "Retrieves the currently authenticated user's profile information",
        tags: ["Users"],
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable(),
      }),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const result = await userRepo.getById(ctx.db, userId);

      if (!result?.name) {
        throw new TRPCError({
          message: `User not found`,
          code: "NOT_FOUND",
        });
      }

      return result;
    }),
  loginWithEmail: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/login/email",
        summary: "Login with email",
        description: "Sends a login URL to the provided email address",
        tags: ["Auth"],
      },
    })
    .input(z.object({ email: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { data } = await ctx.db.auth.signInWithOtp({
        email: input.email,
        options: {
          emailRedirectTo: `${env.WEBSITE_URL}`,
        },
      });

      if (!data)
        throw new TRPCError({
          message: `Failed to login with email`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return { success: true };
    }),
  loginWithOAuth: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/auth/login/oauth",
        summary: "Login with OAuth",
        description:
          "Initiates the login process for a user with the given OAuth provider",
        tags: ["Auth"],
      },
    })
    .input(z.object({ provider: z.string() }))
    .output(z.object({ url: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.provider !== "google")
        throw new TRPCError({
          message: `Unsupported OAuth provider: ${input.provider}`,
          code: "BAD_REQUEST",
        });

      const { data } = await ctx.db.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${env.WEBSITE_URL}/api/auth/confirm`,
        },
      });

      if (!data?.url)
        throw new TRPCError({
          message: `Failed to login with OAuth`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return { url: data.url };
    }),
});
