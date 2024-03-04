import { render } from '@react-email/render';
import { MagicLinkEmail } from "~/email/emails/magic-link";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type DefaultSession } from "next-auth";

import { db } from "~/server/db";
import { mySqlTable } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}



export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        id: user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    }),
  },
  adapter: DrizzleAdapter(db, mySqlTable),
  pages: {
    signIn: "/auth/login",
    // signOut: "/auth/signout",
    // error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  providers: [
    {
      id: 'email',
      type: 'email',
      from: process.env.EMAIL_FROM ?? '',
      server: {},
      maxAge: 24 * 60 * 60,
      name: 'Email',
      options: {},
      async sendVerificationRequest({ identifier: email, url }) {
        const magicLinkEmail = MagicLinkEmail({ loginUrl: url });
        const response = await fetch(process.env.EMAIL_URL ?? '', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EMAIL_TOKEN}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [email],
            subject: 'Login via email',
            html: render(magicLinkEmail),
          }),
        })

        if (response.status !== 200) {
          throw new Error('Error sending magic login')
        }
      },
    }
  ],
});
