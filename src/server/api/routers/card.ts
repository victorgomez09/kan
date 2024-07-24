import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as cardRepo from "~/server/db/repository/card.repo";
import * as labelRepo from "~/server/db/repository/label.repo";
import * as listRepo from "~/server/db/repository/list.repo";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

export const cardRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        listPublicId: z.string().min(12),
        labelPublicIds: z.array(z.string().min(12)),
        memberPublicIds: z.array(z.string().min(12)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) return;

      const list = await listRepo.getWithCardsByPublicId(
        ctx.db,
        input.listPublicId,
      );

      if (!list?.id) return;

      const latestCard = list.cards.length && list.cards[0];

      const newCard = await cardRepo.create(ctx.db, {
        title: input.title,
        createdBy: userId,
        listId: list.id,
        index: latestCard ? latestCard.index + 1 : 0,
      });

      const newCardId = newCard?.id;

      if (newCardId && input.labelPublicIds.length) {
        const labels = await labelRepo.getAllByPublicIds(
          ctx.db,
          input.labelPublicIds,
        );

        if (!labels?.length) return;

        const labelsInsert = labels.map((label) => ({
          cardId: newCardId,
          labelId: label.id,
        }));

        await cardRepo.bulkCreateCardLabelRelationships(ctx.db, labelsInsert);
      }

      if (newCardId && input.memberPublicIds.length) {
        const members = await workspaceRepo.getAllMembersByPublicIds(
          ctx.db,
          input.memberPublicIds,
        );

        if (!members?.length) return;

        const membersInsert = members.map((member) => ({
          cardId: newCardId,
          workspaceMemberId: member.id,
        }));

        await cardRepo.bulkCreateCardWorkspaceMemberRelationships(
          ctx.db,
          membersInsert,
        );
      }

      return newCard;
    }),
  addOrRemoveLabel: protectedProcedure
    .input(
      z.object({
        cardPublicId: z.string().min(12),
        labelPublicId: z.string().min(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) return;

      const card = await cardRepo.getByPublicId(ctx.db, input.cardPublicId);
      const label = await labelRepo.getByPublicId(ctx.db, input.labelPublicId);

      if (!card || !label) return;

      const cardLabelIds = { cardId: card.id, labelId: label.id };

      const existingLabel = await cardRepo.getCardLabelRelationship(
        ctx.db,
        cardLabelIds,
      );

      if (existingLabel) {
        await cardRepo.destroyCardLabelRelationship(ctx.db, cardLabelIds);

        return { newLabel: false };
      }

      await cardRepo.createCardLabelRelationship(ctx.db, cardLabelIds);

      return { newLabel: true };
    }),
  addOrRemoveMember: protectedProcedure
    .input(
      z.object({
        cardPublicId: z.string().min(12),
        workspaceMemberPublicId: z.string().min(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) return;

      const card = await cardRepo.getByPublicId(ctx.db, input.cardPublicId);
      const member = await workspaceRepo.getMemberByPublicId(
        ctx.db,
        input.workspaceMemberPublicId,
      );

      if (!card || !member) return;

      const cardMemberIds = { cardId: card.id, memberId: member.id };

      const existingMember = await cardRepo.getCardMemberRelationship(
        ctx.db,
        cardMemberIds,
      );

      if (existingMember) {
        await cardRepo.destroyCardMemberRelationship(ctx.db, cardMemberIds);

        return { newMember: false };
      }

      await cardRepo.createCardMemberRelationship(ctx.db, cardMemberIds);

      return { newMember: true };
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.string().min(12) }))
    .query(async ({ ctx, input }) => {
      const result = await cardRepo.getWithListAndMembersByPublicId(
        ctx.db,
        input.id,
      );

      return result;
    }),
  update: protectedProcedure
    .input(
      z.object({
        cardId: z.string().min(12),
        title: z.string().min(1),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) return;

      const result = cardRepo.update(
        ctx.db,
        { title: input.title, description: input.description },
        { cardPublicId: input.cardId },
      );

      return result;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        cardPublicId: z.string().min(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) return;

      const card = await cardRepo.getCardWithListByPublicId(
        ctx.db,
        input.cardPublicId,
      );

      if (!card || !card?.list?.id) return;

      const deletedAt = new Date().toISOString();

      await cardRepo.destroy(ctx.db, {
        cardId: card.id,
        deletedAt,
        deletedBy: userId,
      });

      await cardRepo.shiftIndex(ctx.db, {
        listId: card.list.id,
        cardIndex: card.index,
      });
    }),
  reorder: protectedProcedure
    .input(
      z.object({
        cardId: z.string().min(12),
        newListId: z.string().min(12),
        newIndex: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId) return;

      const card = await cardRepo.getCardWithListByPublicId(
        ctx.db,
        input.cardId,
      );

      if (!card) return;

      const currentList = card.list;
      const currentIndex = card.index;

      let newIndex = input.newIndex;

      const newList = await listRepo.getWithCardsByPublicId(
        ctx.db,
        input.newListId,
      );

      if (!newList) return;

      if (newIndex === undefined) {
        const lastCardIndex = newList.cards.length
          ? newList.cards[0]?.index
          : undefined;

        newIndex = lastCardIndex !== undefined ? lastCardIndex + 1 : 0;
      }

      if (!currentList?.id || !newList.id) return;

      const result = await cardRepo.reorder(ctx.db, {
        currentListId: currentList.id,
        newListId: newList.id,
        currentIndex,
        newIndex,
        cardId: card.id,
      });

      return { success: !!result.error };
    }),
});
