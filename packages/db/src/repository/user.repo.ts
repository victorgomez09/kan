import type { SupabaseClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import type { Database } from "@kan/db/types/database.types";
import * as schema from "@kan/db/schema";

export const getById = async (db: dbClient, userId: string) => {
  const data = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      stripeCustomerId: true,
    },
    where: eq(schema.users.id, userId),
  });

  return data;
};

export const getByEmail = async (
  db: SupabaseClient<Database>,
  email: string,
) => {
  const { data } = await db
    .from("user")
    .select(`id, name, email`)
    .eq("email", email)
    .limit(1)
    .single();

  return data;
};

export const create = async (
  db: SupabaseClient<Database>,
  user: { id: string; email: string; stripeCustomerId: string },
) => {
  const { data } = await db
    .from("user")
    .insert({
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripeCustomerId,
    })
    .select()
    .limit(1)
    .single();

  return data;
};

export const update = async (
  db: SupabaseClient<Database>,
  userId: string,
  updates: { image?: string; name?: string },
) => {
  const { data } = await db
    .from("user")
    .update({ image: updates.image, name: updates.name })
    .eq("id", userId)
    .select(`image, name`)
    .single();

  return data;
};
