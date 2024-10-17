import { generateUID } from "~/utils/generateUID";
import { type Database } from "~/types/database.types";
import { type SupabaseClient } from "@supabase/supabase-js";

export const create = async (
  db: SupabaseClient<Database>,
  memberInput: {
    userId: string;
    workspaceId: number;
    createdBy: string;
    role: "admin" | "member" | "guest";
    status: "invited" | "active" | "removed";
  },
) => {
  const { data } = await db
    .from("workspace_members")
    .insert({
      publicId: generateUID(),
      userId: memberInput.userId,
      workspaceId: memberInput.workspaceId,
      createdBy: memberInput.createdBy,
      role: memberInput.role,
      status: memberInput.status,
    })
    .select(`id, publicId`)
    .limit(1)
    .single();

  return data;
};
