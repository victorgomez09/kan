import type { SupabaseClient } from "@supabase/supabase-js";
import { and, eq, isNull, sql } from "drizzle-orm";

import type { dbClient } from "@kan/db/client";
import type { Database } from "@kan/db/types/database.types";
import * as schema from "@kan/db/schema";
import { generateUID } from "@kan/shared/utils";

export const create = async (
  db: dbClient,
  cardInput: {
    title: string;
    description: string;
    createdBy: string;
    listId: number;
    index: number;
  },
) => {
  return db.transaction(async (tx) => {
    const getExistingCardAtIndex = async () =>
      tx.query.cards.findFirst({
        columns: {
          id: true,
        },
        where: and(
          eq(schema.cards.listId, cardInput.listId),
          eq(schema.cards.index, cardInput.index),
          isNull(schema.cards.deletedAt),
        ),
      });

    const existingCardAtIndex = await getExistingCardAtIndex();

    if (existingCardAtIndex?.id) {
      await tx.execute(sql`
        UPDATE card
        SET index = index + 1
        WHERE "listId" = ${cardInput.listId} AND index >= ${cardInput.index} AND "deletedAt" IS NULL;
      `);

      const refetchedExistingCardAtIndex = await getExistingCardAtIndex();

      if (refetchedExistingCardAtIndex?.id) return tx.rollback();
    }

    const result = await tx
      .insert(schema.cards)
      .values({
        publicId: generateUID(),
        title: cardInput.title,
        description: cardInput.description,
        createdBy: cardInput.createdBy,
        listId: cardInput.listId,
        index: cardInput.index,
      })
      .returning({ id: schema.cards.id });

    if (!result[0]) return tx.rollback();

    await tx.insert(schema.cardActivities).values({
      publicId: generateUID(),
      cardId: result[0].id,
      type: "card.created",
      createdBy: cardInput.createdBy,
    });

    return result[0];
  });
};

export const bulkCreateCardLabelRelationships = async (
  db: SupabaseClient<Database>,
  cardLabelRelationshipInput: {
    cardId: number;
    labelId: number;
  }[],
) => {
  const { data } = await db
    .from("_card_labels")
    .insert(cardLabelRelationshipInput)
    .select();

  return data;
};

export const bulkCreateCardWorkspaceMemberRelationships = async (
  db: SupabaseClient<Database>,
  cardWorkspaceMemberRelationshipInput: {
    cardId: number;
    workspaceMemberId: number;
  }[],
) => {
  const { data } = await db
    .from("_card_workspace_members")
    .insert(cardWorkspaceMemberRelationshipInput)
    .select();

  return data;
};

export const update = async (
  db: SupabaseClient<Database>,
  cardInput: {
    title: string;
    description: string;
  },
  args: {
    cardPublicId: string;
  },
) => {
  const { data } = await db
    .from("card")
    .update({ title: cardInput.title, description: cardInput.description })
    .eq("publicId", args.cardPublicId)
    .is("deletedAt", null)
    .select(`id, publicId, title, description`)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  return data;
};

export const getCardWithListByPublicId = async (
  db: SupabaseClient<Database>,
  cardPublicId: string,
) => {
  const { data } = await db
    .from("card")
    .select(`id, index, list (id, boardId)`)
    .eq("publicId", cardPublicId)
    .is("deletedAt", null)
    .limit(1)
    .single();

  return data;
};

export const getByPublicId = async (
  db: SupabaseClient<Database>,
  cardPublicId: string,
) => {
  const { data } = await db
    .from("card")
    .select(`id, publicId, title, description`)
    .eq("publicId", cardPublicId)
    .limit(1)
    .single();

  return data;
};

export const getCardLabelRelationship = async (
  db: SupabaseClient<Database>,
  args: { cardId: number; labelId: number },
) => {
  const { data } = await db
    .from("_card_labels")
    .select()
    .eq("cardId", args.cardId)
    .eq("labelId", args.labelId)
    .limit(1)
    .single();

  return data;
};

export const bulkCreate = async (
  db: SupabaseClient<Database>,
  cardInput: {
    publicId: string;
    title: string;
    description: string;
    createdBy: string;
    listId: number;
    index: number;
    importId?: number;
  }[],
) => {
  const { data } = await db.from("card").insert(cardInput).select(`id`);

  return data;
};

export const createCardLabelRelationship = async (
  db: SupabaseClient<Database>,
  cardLabelRelationshipInput: { cardId: number; labelId: number },
) => {
  const { data } = await db
    .from("_card_labels")
    .insert({
      cardId: cardLabelRelationshipInput.cardId,
      labelId: cardLabelRelationshipInput.labelId,
    })
    .select()
    .limit(1)
    .single();

  return data;
};

export const bulkCreateCardLabelRelationship = async (
  db: SupabaseClient<Database>,
  cardLabelRelationshipInput: { cardId: number; labelId: number }[],
) => {
  const { data } = await db
    .from("_card_labels")
    .insert(cardLabelRelationshipInput)
    .select();

  return data;
};

export const getCardMemberRelationship = async (
  db: SupabaseClient<Database>,
  args: { cardId: number; memberId: number },
) => {
  const { data } = await db
    .from("_card_workspace_members")
    .select()
    .eq("cardId", args.cardId)
    .eq("workspaceMemberId", args.memberId)
    .limit(1)
    .single();

  return data;
};

export const createCardMemberRelationship = async (
  db: SupabaseClient<Database>,
  cardMemberRelationshipInput: { cardId: number; memberId: number },
) => {
  const { error } = await db.from("_card_workspace_members").insert({
    cardId: cardMemberRelationshipInput.cardId,
    workspaceMemberId: cardMemberRelationshipInput.memberId,
  });

  return { success: !error };
};

export const getWithListAndMembersByPublicId = async (
  db: SupabaseClient<Database>,
  cardPublicId: string,
) => {
  const { data } = await db
    .from("card")
    .select(
      `
        publicId,
        title,
        description,
        labels:label (
          publicId,
          name,
          colourCode
        ),
        list (
          publicId,
          name,
          board (
            publicId,
            name,
            labels:label (
              publicId,
              colourCode,
              name
            ),
            lists:list (
              publicId,
              name
            ),
            workspace (
              publicId,
              members:workspace_members (
                publicId,
                user!workspace_members_userId_user_id_fk (
                  id,
                  name,
                  email,
                  image
                )
              )
            )
          )
        ),
        members:workspace_members (
          publicId,
          user!workspace_members_userId_user_id_fk (
            id,
            name
          )
        ),
        activities:card_activity (
          publicId,
          type,
          createdAt,
          fromIndex,
          toIndex,
          fromTitle,
          toTitle,
          fromDescription,
          toDescription,
          fromList:list!card_activity_fromListId_list_id_fk (
            publicId,
            name,
            index
          ),
          toList:list!card_activity_toListId_list_id_fk (
            publicId,
            name,
            index
          ),
          label!card_activity_labelId_label_id_fk (
            publicId,
            name
          ),
          member:workspace_members!card_activity_workspaceMemberId_workspace_members_id_fk (
            publicId,
            user!workspace_members_userId_user_id_fk (
              id,
              name,
              email
            )
          ),
          user!card_activity_createdBy_user_id_fk (
            id,
            name,
            email
          ),
          comment:card_comments!card_activity_commentId_card_comments_id_fk (
            publicId,
            comment,
            createdBy,
            updatedAt
          )
        )
      `,
    )
    .eq("publicId", cardPublicId)
    .is("deletedAt", null)
    .is("list.board.lists.deletedAt", null)
    .is("list.board.workspace.members.deletedAt", null)
    .is("activities.comment.deletedAt", null)
    .order("index", { referencedTable: "list.board.lists", ascending: true })
    .is("members.deletedAt", null)
    .limit(1)
    .single();

  return data;
};

export const reorder = async (
  db: SupabaseClient<Database>,
  args: {
    currentListId: number;
    newListId: number;
    currentIndex: number;
    newIndex: number;
    cardId: number;
  },
) => {
  const { error } = await db.rpc("reorder_cards", {
    current_list_id: args.currentListId,
    new_list_id: args.newListId,
    current_index: args.currentIndex,
    new_index: args.newIndex,
    card_id: args.cardId,
  });

  return { success: !error };
};

export const shiftIndex = async (
  db: SupabaseClient<Database>,
  args: {
    listId: number;
    cardIndex: number;
  },
) => {
  const { data } = await db.rpc("shift_card_index", {
    list_id: args.listId,
    card_index: args.cardIndex,
  });

  return data;
};

export const pushIndex = async (
  db: SupabaseClient<Database>,
  args: {
    listId: number;
    cardIndex: number;
  },
) => {
  const { data } = await db.rpc("push_card_index", {
    list_id: args.listId,
    card_index: args.cardIndex,
  });

  return data;
};

export const softDelete = async (
  db: SupabaseClient<Database>,
  args: {
    cardId: number;
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const { data } = await db
    .from("card")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .eq("id", args.cardId)
    .select(`id`)
    .order("id", { ascending: true })
    .limit(1)
    .single();

  return data;
};

export const softDeleteAllByListIds = async (
  db: SupabaseClient<Database>,
  args: {
    listIds: number[];
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const { data } = await db
    .from("card")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .in("listId", args.listIds)
    .is("deletedAt", null)
    .select(`id`);

  return data;
};

export const hardDeleteCardMemberRelationship = async (
  db: SupabaseClient<Database>,
  args: { cardId: number; memberId: number },
) => {
  const { error } = await db
    .from("_card_workspace_members")
    .delete()
    .eq("cardId", args.cardId)
    .eq("workspaceMemberId", args.memberId)
    .select();

  return { success: !error };
};

export const hardDeleteCardLabelRelationship = async (
  db: SupabaseClient<Database>,
  args: { cardId: number; labelId: number },
) => {
  const { data } = await db
    .from("_card_labels")
    .delete()
    .eq("cardId", args.cardId)
    .eq("labelId", args.labelId)
    .select()
    .single();

  return { data };
};

export const hardDeleteAllCardLabelRelationships = async (
  db: SupabaseClient<Database>,
  labelId: number,
) => {
  const result = await db.from("_card_labels").delete().eq("labelId", labelId);

  return result;
};
