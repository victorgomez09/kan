import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { apiKey } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins/magic-link";

import { createDrizzleClient } from "@kan/db/client";
import * as userRepo from "@kan/db/repository/user.repo";
import * as schema from "@kan/db/schema";
import { sendEmail } from "@kan/email";
import { createStripeClient } from "@kan/stripe";

const db = createDrizzleClient();
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_BASE_URL!,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },
  plugins: [
    apiKey(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail(email, "Sign in to kan.bn", "MAGIC_LINK", {
          magicLoginUrl: url,
        });
      },
    }),
  ],
  hooks: {
    // after: createAuthMiddleware(async (ctx) => {
    //   if (ctx.path.startsWith("/sign-up") || ctx.path.startsWith("/sign-in")) {
    //     const session = ctx.context.session;
    //     if (
    //       session &&
    //       process.env.NEXT_PUBLIC_KAN_ENV === "cloud" &&
    //       !session.user.stripeCustomerId
    //     ) {
    //       const stripe = createStripeClient();
    //       const stripeCustomer = await stripe.customers.create({
    //         email: session.user.email,
    //         metadata: {
    //           userId: session.user.id,
    //         },
    //       });
    //       await userRepo.update(db, session.user.id, {
    //         stripeCustomerId: stripeCustomer.id,
    //       });
    //     }
    //   }
    // }),
  },
  advanced: {
    cookiePrefix: "kan",
    database: {
      generateId: false,
    },
  },
});
