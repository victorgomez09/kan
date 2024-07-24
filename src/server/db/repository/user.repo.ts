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
