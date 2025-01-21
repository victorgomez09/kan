import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
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
          emailRedirectTo: `${process.env.WEBSITE_URL}`,
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
          redirectTo: `${process.env.WEBSITE_URL}/api/auth/confirm`,
        },
      });

      if (!data.url)
        throw new TRPCError({
          message: `Failed to login with OAuth`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return { url: data.url };
    }),
});
