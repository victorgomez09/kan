import type { SupabaseClient } from "@supabase/supabase-js";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import type { Database } from "@kan/db/types/database.types";
import { boards, cards, lists, workspaceMembers } from "@kan/db/schema";
import { generateUID } from "@kan/shared/utils";

export const getAllByWorkspaceId = (db: dbClient, workspaceId: number) => {
  return db.query.boards.findMany({
    columns: {
      publicId: true,
      name: true,
    },
    where: and(eq(boards.workspaceId, workspaceId), isNull(boards.deletedAt)),
  });
};

export const getIdByPublicId = async (
  db: SupabaseClient<Database>,
  boardPublicId: string,
) => {
  const { data } = await db
    .from("board")
    .select("id")
    .eq("publicId", boardPublicId)
    .limit(1)
    .single();

  return data;
};

export const getByPublicId = async (
  db: dbClient,
  boardPublicId: string,
  filters: {
    members: string[];
    labels: string[];
  },
) => {
  const board = await db.query.boards.findFirst({
    columns: {
      publicId: true,
      name: true,
      slug: true,
      visibility: true,
    },
    with: {
      workspace: {
        columns: {
          publicId: true,
        },
        with: {
          members: {
            columns: {
              publicId: true,
            },
            with: {
              user: {
                columns: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
            where: isNull(workspaceMembers.deletedAt),
          },
        },
      },
      labels: {
        columns: {
          publicId: true,
          name: true,
          colourCode: true,
        },
      },
      lists: {
        columns: {
          publicId: true,
          name: true,
          boardId: true,
          index: true,
        },
        with: {
          cards: {
            columns: {
              publicId: true,
              title: true,
              description: true,
              listId: true,
              index: true,
            },
            with: {
              labels: {
                with: {
                  label: {
                    columns: {
                      publicId: true,
                      name: true,
                      colourCode: true,
                    },
                    // where: inArray(label.publicId, filters.labels),
                  },
                },
              },
              members: {
                with: {
                  member: {
                    columns: {
                      publicId: true,
                      deletedAt: true,
                    },
                    with: {
                      user: {
                        columns: {
                          name: true,
                          email: true,
                          image: true,
                        },
                      },
                    },
                    // https://github.com/drizzle-team/drizzle-orm/issues/2903
                    // where: isNull(workspaceMembers.deletedAt),
                  },
                },
                where:
                  filters.members.length > 0
                    ? inArray(workspaceMembers, filters.members)
                    : undefined,
              },
            },
            where: isNull(cards.deletedAt),
            orderBy: [asc(cards.index)],
          },
        },
        where: isNull(lists.deletedAt),
        orderBy: [asc(lists.index)],
      },
    },
    where: and(eq(boards.publicId, boardPublicId), isNull(boards.deletedAt)),
  });

  if (!board) return null;

  const formattedResult = {
    ...board,
    lists: board.lists.map((list) => ({
      ...list,
      cards: list.cards.map((card) => ({
        ...card,
        labels: card.labels.map((label) => label.label),
        members: card.members
          .map((member) => member.member)
          .filter((member) => member.deletedAt === null),
      })),
    })),
  };

  return formattedResult;
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
            labels:label(
              publicId,
              name,
              colourCode
            ),
            _filteredLabels:label${filters.labels.length > 0 ? "!inner" : ""} (
              publicId
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
    query = query.in("lists.cards._filteredLabels.publicId", filters.labels);
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
