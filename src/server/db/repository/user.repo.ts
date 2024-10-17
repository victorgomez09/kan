import { type Database } from "~/types/database.types";
import { type SupabaseClient } from "@supabase/supabase-js";

export const getById = async (db: SupabaseClient<Database>, userId: string) => {
  const { data } = await db
    .from("user")
    .select(`id, name, email`)
    .eq("id", userId)
    .limit(1)
    .single();

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
  user: { id: string; email: string },
) => {
  const { data } = await db
    .from("user")
    .insert({ id: user.id, email: user.email })
    .select()
    .limit(1)
    .single();

  return data;
};
