import { generateUID } from "~/utils/generateUID";
import { type Database } from "~/types/database.types";
import { type SupabaseClient } from "@supabase/supabase-js";

export const create = async (
  db: SupabaseClient<Database>,
  cardInput: {
    title: string;
    createdBy: string;
    listId: number;
    index: number;
  },
) => {
  const { data } = await db
    .from("card")
    .insert({
      publicId: generateUID(),
      title: cardInput.title,
      createdBy: cardInput.createdBy,
      listId: cardInput.listId,
      index: cardInput.index,
    })
    .select(`id`)
    .limit(1)
    .single();

  return data;
};

export const bulkCreateCardLabelRelationships = async (
  db: SupabaseClient<Database>,
  cardLabelRelationshipInput: {
    cardId: number;
    labelId: number;
  }[],
) => {
  const result = db.from("_card_labels").insert(cardLabelRelationshipInput);

  return result;
};

export const bulkCreateCardWorkspaceMemberRelationships = async (
  db: SupabaseClient<Database>,
  cardWorkspaceMemberRelationshipInput: {
    cardId: number;
    workspaceMemberId: number;
  }[],
) => {
  const result = db
    .from("_card_workspace_members")
    .insert(cardWorkspaceMemberRelationshipInput);

  return result;
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
    .is("deletedAt", null);

  return data;
};

export const destroy = async (
  db: SupabaseClient<Database>,
  args: {
    cardId: number;
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const result = await db
    .from("card")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .eq("id", args.cardId);

  return result;
};

export const destroyAllByListIds = async (
  db: SupabaseClient<Database>,
  args: {
    listIds: number[];
    deletedAt: string;
    deletedBy: string;
  },
) => {
  const result = await db
    .from("card")
    .update({ deletedAt: args.deletedAt, deletedBy: args.deletedBy })
    .in("listId", args.listIds)
    .is("deletedAt", null);

  return result;
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
    .select(`id`)
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
  const data = await db.from("card").insert(cardInput);

  return data;
};

export const destroyCardLabelRelationship = async (
  db: SupabaseClient<Database>,
  args: { cardId: number; labelId: number },
) => {
  const result = await db
    .from("_card_labels")
    .delete()
    .eq("cardId", args.cardId)
    .eq("labelId", args.labelId);

  return result;
};

export const createCardLabelRelationship = async (
  db: SupabaseClient<Database>,
  cardLabelRelationshipInput: { cardId: number; labelId: number },
) => {
  const { data } = await db.from("_card_labels").insert({
    cardId: cardLabelRelationshipInput.cardId,
    labelId: cardLabelRelationshipInput.labelId,
  });

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

export const destroyCardMemberRelationship = async (
  db: SupabaseClient<Database>,
  args: { cardId: number; memberId: number },
) => {
  const result = await db
    .from("_card_workspace_members")
    .delete()
    .eq("cardId", args.cardId)
    .eq("workspaceMemberId", args.memberId);

  return result;
};

export const createCardMemberRelationship = async (
  db: SupabaseClient<Database>,
  cardMemberRelationshipInput: { cardId: number; memberId: number },
) => {
  const { data } = await db.from("_card_workspace_members").insert({
    cardId: cardMemberRelationshipInput.cardId,
    workspaceMemberId: cardMemberRelationshipInput.memberId,
  });

  return data;
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
                user (
                  id,
                  name
                )
              )
            )
          )
        ),
        members:workspace_members (
          publicId,
          user (
            id,
            name
          )
        )
      `,
    )
    .eq("publicId", cardPublicId)
    .is("deletedAt", null)
    .is("list.board.lists.deletedAt", null)
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
  const result = await db.rpc("reorder_cards", {
    current_list_id: args.currentListId,
    new_list_id: args.newListId,
    current_index: args.currentIndex,
    new_index: args.newIndex,
    card_id: args.cardId,
  });

  return result;
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
