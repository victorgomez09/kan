import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import type { BoardVisibilityStatus } from "@kan/db/schema";
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

export const getIdByPublicId = async (db: dbClient, boardPublicId: string) => {
  const board = await db.query.boards.findFirst({
    columns: {
      id: true,
    },
    where: eq(boards.publicId, boardPublicId),
  });

  return board;
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
  db: dbClient,
  boardSlug: string,
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
            },
            where: isNull(cards.deletedAt),
            orderBy: [asc(cards.index)],
          },
        },
        where: isNull(lists.deletedAt),
        orderBy: [asc(lists.index)],
      },
    },
    where: and(eq(boards.slug, boardSlug), isNull(boards.deletedAt)),
  });

  if (!board) return null;

  const formattedResult = {
    ...board,
    lists: board.lists.map((list) => ({
      ...list,
      cards: list.cards.map((card) => ({
        ...card,
        labels: card.labels.map((label) => label.label),
      })),
    })),
  };

  return formattedResult;
};

export const getWithListIdsByPublicId = (
  db: dbClient,
  boardPublicId: string,
) => {
  return db.query.boards.findFirst({
    columns: {
      id: true,
    },
    with: {
      lists: {
        columns: {
          id: true,
        },
      },
    },
    where: eq(boards.publicId, boardPublicId),
  });
};

export const getWithLatestListIndexByPublicId = (
  db: dbClient,
  boardPublicId: string,
) => {
  return db.query.boards.findFirst({
    columns: {
      id: true,
    },
    with: {
      lists: {
        columns: {
          index: true,
        },
        where: isNull(lists.deletedAt),
        orderBy: [desc(lists.index)],
        limit: 1,
      },
    },
    where: eq(boards.publicId, boardPublicId),
  });
};

export const create = async (
  db: dbClient,
  boardInput: {
    publicId?: string;
    name: string;
    createdBy: string;
    workspaceId: number;
    importId?: number;
    slug: string;
  },
) => {
  const [result] = await db
    .insert(boards)
    .values({
      publicId: boardInput.publicId ?? generateUID(),
      name: boardInput.name,
      createdBy: boardInput.createdBy,
      workspaceId: boardInput.workspaceId,
      importId: boardInput.importId,
      slug: boardInput.slug,
    })
    .returning({
      id: boards.id,
      publicId: boards.publicId,
      name: boards.name,
    });

  return result;
};

export const update = async (
  db: dbClient,
  boardInput: {
    name: string | undefined;
    slug: string | undefined;
    visibility: BoardVisibilityStatus | undefined;
    boardPublicId: string;
  },
) => {
  const [result] = await db
    .update(boards)
    .set({
      name: boardInput.name,
      slug: boardInput.slug,
      visibility: boardInput.visibility,
      updatedAt: new Date(),
    })
    .where(eq(boards.publicId, boardInput.boardPublicId))
    .returning({
      publicId: boards.publicId,
      name: boards.name,
    });

  return result;
};

export const softDelete = async (
  db: dbClient,
  args: {
    boardId: number;
    deletedAt: Date;
    deletedBy: string;
  },
) => {
  const [result] = await db
    .update(boards)
    .set({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .where(and(eq(boards.id, args.boardId), isNull(boards.deletedAt)))
    .returning({
      publicId: boards.publicId,
      name: boards.name,
    });

  return result;
};

export const hardDelete = async (db: dbClient, workspaceId: number) => {
  const [result] = await db
    .delete(boards)
    .where(eq(boards.workspaceId, workspaceId))
    .returning({
      publicId: boards.publicId,
      name: boards.name,
    });

  return result;
};

export const isSlugUnique = async (
  db: dbClient,
  args: { slug: string; workspaceId: number },
) => {
  const result = await db.query.boards.findFirst({
    columns: {
      slug: true,
    },
    where: and(
      eq(boards.slug, args.slug),
      eq(boards.workspaceId, args.workspaceId),
      isNull(boards.deletedAt),
    ),
  });

  return result === undefined;
};
