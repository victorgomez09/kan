import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@kan/db/types/database.types";
import { generateUID } from "@kan/shared/utils";

export const getAllByWorkspaceId = async (
  db: SupabaseClient<Database>,
  workspaceId: number,
) => {
  const { data } = await db
    .from("board")
    .select(`publicId, name`)
    .is("deletedAt", null)
    .eq("workspaceId", workspaceId);

  return data ?? [];
};

export const getByPublicId = async (
  db: SupabaseClient<Database>,
  boardPublicId: string,
  filters: {
    members: string[];
    labels: string[];
  },
) => {
  let query = db
    .from("board")
    .select(
      `
        publicId,
        name,
        slug,
        visibility,
        workspace (
          publicId,
          members:workspace_members (
            publicId,
            user!workspace_members_userId_user_id_fk (
              name,
              email,
              image
            )
          )
        ),
        labels:label (
          publicId,
          name,
          colourCode
        ),
        lists:list (
          publicId,
          name,
          boardId,
          index,
          cards:card (
            publicId,
            title,
            description,
            listId,
            index,
            labels:label${filters.labels.length > 0 ? "!inner" : ""} (
              publicId,
              name,
              colourCode
            ),
            members:workspace_members${filters.members.length > 0 ? "!inner" : ""} (
              publicId,
              user!workspace_members_userId_user_id_fk (
                name,
                email,
                image
              )
            )
          )
        )
      `,
    )
    .eq("publicId", boardPublicId)
    .is("deletedAt", null)
    .is("lists.deletedAt", null)
    .is("lists.cards.deletedAt", null)
    .is("workspace.members.deletedAt", null)
    .is("lists.cards.members.deletedAt", null);

  if (filters.labels.length > 0) {
    query = query.in("lists.cards.labels.publicId", filters.labels);
  }

  if (filters.members.length > 0) {
    query = query.in("lists.cards.members.publicId", filters.members);
  }

  const { data } = await query
    .order("index", { foreignTable: "list", ascending: true })
    .order("index", { foreignTable: "list.card", ascending: true })
    .limit(1)
    .single();

  return data;
};

export const getBySlug = async (
  db: SupabaseClient<Database>,
  boardSlug: string,
  filters: {
    members: string[];
    labels: string[];
  },
) => {
  let query = db
    .from("board")
    .select(
      `
        publicId,
        name,
        slug,
        workspace (
          publicId,
          name,
          slug,
          description
        ),
        labels:label (
          publicId,
          name,
          colourCode
        ),
        lists:list (
          publicId,
          name,
          boardId,
          index,
          cards:card (
            publicId,
            title,
            description,
            listId,
            index,
            labels:label${filters.labels.length > 0 ? "!inner" : ""} (
              publicId,
              name,
              colourCode
            )
          )
        )
      `,
    )
    .eq("slug", boardSlug)
    .is("deletedAt", null)
    .is("lists.deletedAt", null)
    .is("lists.cards.deletedAt", null);

  if (filters.labels.length > 0) {
    query = query.in("lists.cards.labels.publicId", filters.labels);
  }

  const { data } = await query
    .order("index", { foreignTable: "list", ascending: true })
    .order("index", { foreignTable: "list.card", ascending: true })
    .limit(1)
    .single();

  return data;
};

export const getWithListIdsByPublicId = async (
  db: SupabaseClient<Database>,
  boardPublicId: string,
) => {
  const { data } = await db
    .from("board")
    .select(`id, lists:list (id)`)
    .eq("publicId", boardPublicId)
    .limit(1)
    .single();

  return data;
};

export const getWithLatestListIndexByPublicId = async (
  db: SupabaseClient<Database>,
  boardPublicId: string,
) => {
  const { data } = await db
    .from("board")
    .select(`id, lists:list (index)`)
    .eq("publicId", boardPublicId)
    .order("index", { foreignTable: "list", ascending: false })
    .is("list.deletedAt", null)
    .limit(1)
    .single();

  return data;
};

export const create = async (
  db: SupabaseClient<Database>,
  boardInput: {
    publicId?: string;
    name: string;
    createdBy: string;
    workspaceId: number;
    importId?: number;
    slug: string;
  },
) => {
  const { data } = await db
    .from("board")
    .insert({
      publicId: boardInput.publicId ?? generateUID(),
      name: boardInput.name,
      createdBy: boardInput.createdBy,
      workspaceId: boardInput.workspaceId,
      importId: boardInput.importId,
      slug: boardInput.slug,
    })
    .select(`id, publicId, name`)
    .limit(1)
    .single();

  return data;
};

export const update = async (
  db: SupabaseClient<Database>,
  boardInput: {
    name: string | undefined;
    slug: string | undefined;
    visibility: "public" | "private" | undefined;
    boardPublicId: string;
  },
) => {
  const { data } = await db
    .from("board")
    .update({
      name: boardInput.name,
      slug: boardInput.slug,
      visibility: boardInput.visibility,
      updatedAt: new Date().toISOString(),
    })
    .eq("publicId", boardInput.boardPublicId)
    .select(`publicId, name`)
    .limit(1)
    .order("id", { ascending: false })
    .single();

  return data;
};

export const softDelete = async (
  db: SupabaseClient<Database>,
  args: {
    boardId: number;
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const result = db
    .from("board")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .eq("id", args.boardId)
    .is("deletedAt", null);

  return result;
};

export const hardDelete = async (
  db: SupabaseClient<Database>,
  workspaceId: number,
) => {
  const result = db.from("board").delete().eq("workspaceId", workspaceId);

  return result;
};

export const isSlugUnique = async (
  db: SupabaseClient<Database>,
  args: { slug: string; workspaceId: number },
) => {
  const { data } = await db
    .from("board")
    .select("slug")
    .eq("slug", args.slug)
    .eq("workspaceId", args.workspaceId)
    .is("deletedAt", null)
    .limit(1);

  return data?.length === 0;
};
