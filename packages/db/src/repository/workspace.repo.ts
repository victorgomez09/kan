import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";
import { generateUID } from "@kan/utils";

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
    .select(`id, publicId, name, slug, description, plan`)
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

export const update = async (
  db: SupabaseClient<Database>,
  workspacePublicId: string,
  workspaceInput: {
    name?: string;
    slug?: string;
    plan?: "free" | "pro" | "enterprise";
    description?: string;
  },
) => {
  const { data } = await db
    .from("workspace")
    .update({
      name: workspaceInput.name,
      slug: workspaceInput.slug,
      plan: workspaceInput.plan,
      description: workspaceInput.description,
    })
    .eq("publicId", workspacePublicId)
    .is("deletedAt", null);

  return data;
};

export const getByPublicId = async (
  db: SupabaseClient<Database>,
  workspacePublicId: string,
) => {
  const { data } = await db
    .from("workspace")
    .select(`id, publicId, name, plan`)
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
        id,
        publicId,
        members: workspace_members (
          publicId,
          role,
          status,
          user!workspace_members_userId_user_id_fk (
            id,
            name,
            email,
            image
          )
        )
      `,
    )
    .eq("publicId", workspacePublicId)
    .is("deletedAt", null)
    .is("members.deletedAt", null)
    .limit(1)
    .single();

  return data;
};

export const getBySlugWithBoards = async (
  db: SupabaseClient<Database>,
  workspaceSlug: string,
) => {
  const { data } = await db
    .from("workspace")
    .select(
      `
        publicId,
        name,
        description,
        slug,
        boards: board (
          publicId,
          slug,
          name
        )
      `,
    )
    .eq("slug", workspaceSlug)
    .is("deletedAt", null)
    .is("boards.deletedAt", null)
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
          name,
          description,
          slug,
          plan
        )
      `,
    )
    .eq("userId", userId)
    .is("deletedAt", null);

  return data ?? [];
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

export const hardDelete = async (
  db: SupabaseClient<Database>,
  workspacePublicId: string,
) => {
  const result = db
    .from("workspace")
    .delete()
    .eq("publicId", workspacePublicId);

  return result;
};

export const isWorkspaceSlugAvailable = async (
  db: SupabaseClient<Database>,
  workspaceSlug: string,
) => {
  const { data } = await db
    .from("workspace")
    .select("id")
    .eq("slug", workspaceSlug)
    .is("deletedAt", null)
    .limit(1)
    .single();

  return data === null;
};
