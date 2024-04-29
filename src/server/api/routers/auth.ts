import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { env } from "~/env.mjs";

export const authRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) return;

    const { data } = await ctx.db
      .from("user")
      .select(`id, name, email`)
      .eq("id", ctx.user.id)
      .limit(1)
      .single();

    return data;
  }),
  login: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data } = await ctx.db.auth.signInWithOtp({
        email: input.email,
        options: {
          emailRedirectTo: `${env.WEBSITE_URL}`,
        },
      });

      return data;
    }),
});
