import { eq } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import { users } from "@kan/db/schema";

export const getById = async (db: dbClient, userId: string) => {
  return await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      stripeCustomerId: true,
    },
    where: eq(users.id, userId),
  });
};

export const getByEmail = (db: dbClient, email: string) => {
  return db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
    },
    where: eq(users.email, email),
  });
};

export const create = async (
  db: dbClient,
  user: { id: string; email: string; stripeCustomerId: string },
) => {
  const [result] = await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
      emailVerified: false,
    })
    .returning();

  return result;
};

export const update = async (
  db: dbClient,
  userId: string,
  updates: { image?: string; name?: string },
) => {
  const [result] = await db
    .update(users)
    .set({
      name: updates.name,
      image: updates.image,
    })
    .where(eq(users.id, userId))
    .returning({
      name: users.name,
      image: users.image,
    });

  return result;
};
