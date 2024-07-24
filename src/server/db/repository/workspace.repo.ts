import { generateUID } from "~/utils/generateUID";
import { type Database } from "~/types/database.types";
import { type SupabaseClient } from "@supabase/supabase-js";

export const create = async (
  db: SupabaseClient<Database>,
  workspaceInput: {
    name: string;
    slug: string;
    createdBy: string;
  },
) => {
  const { data } = await db
    .from("workspace")
    .insert({
      publicId: generateUID(),
      name: workspaceInput.name,
      slug: workspaceInput.name.toLowerCase(),
      createdBy: workspaceInput.createdBy,
    })
    .select(`id, publicId, name`)
    .limit(1)
    .single();

  if (data)
    await db.from("workspace_members").insert({
      publicId: generateUID(),
      userId: workspaceInput.createdBy,
      workspaceId: data.id,
      createdBy: workspaceInput.createdBy,
      role: "admin",
    });

  const newWorkspace = { ...data };

  delete newWorkspace.id;

  return newWorkspace;
};

export const getByPublicId = async (
  db: SupabaseClient<Database>,
  workspacePublicId: string,
) => {
  const { data } = await db
    .from("workspace")
    .select(`id, publicId, name`)
    .is("deletedAt", null)
    .eq("publicId", workspacePublicId)
    .limit(1)
    .single();

  return data;
};

export const getByPublicIdWithMembers = async (
  db: SupabaseClient<Database>,
  workspacePublicId: string,
) => {
  const { data } = await db
    .from("workspace")
    .select(
      `
        publicId,
        members: workspace_members (
          publicId,
          role,
          user (
            id,
            name,
            email
          )
        )
      `,
    )
    .eq("publicId", workspacePublicId)
    .is("deletedAt", null)
    .limit(1)
    .single();

  return data;
};

export const getAllByUserId = async (
  db: SupabaseClient<Database>,
  userId: string,
) => {
  const { data } = await db
    .from("workspace_members")
    .select(
      `
        role,
        workspace (
          publicId,
          name
        )
      `,
    )
    .eq("userId", userId)
    .is("deletedAt", null);

  return data;
};

export const getMemberByPublicId = async (
  db: SupabaseClient<Database>,
  memberPublicId: string,
) => {
  const { data } = await db
    .from("workspace_members")
    .select(`id`)
    .eq("publicId", memberPublicId)
    .limit(1)
    .single();

  return data;
};

export const getAllMembersByPublicIds = async (
  db: SupabaseClient<Database>,
  memberPublicIds: string[],
) => {
  const { data } = await db
    .from("workspace_members")
    .select(`id`)
    .eq("publicId", memberPublicIds);

  return data;
};
