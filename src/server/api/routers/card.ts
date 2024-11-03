import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import * as cardRepo from "~/server/db/repository/card.repo";
import * as labelRepo from "~/server/db/repository/label.repo";
import * as listRepo from "~/server/db/repository/list.repo";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

export const cardRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({
      openapi: {
        summary: "Create a card",
        method: "POST",
        path: "/cards",
        description: "Creates a new card for a given list",
        tags: ["Cards"],
        protect: true,
      },
    })
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().max(10000),
        listPublicId: z.string().min(12),
        labelPublicIds: z.array(z.string().min(12)),
        memberPublicIds: z.array(z.string().min(12)),
        position: z.enum(["start", "end"]),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof cardRepo.create>>>())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const list = await listRepo.getWithCardsByPublicId(
        ctx.db,
        input.listPublicId,
      );

      if (!list?.id)
        throw new TRPCError({
          message: `List with public ID ${input.listPublicId} not found`,
          code: "NOT_FOUND",
        });

      const lastCard = list.cards.length && list.cards[0];

      let index = 0;

      if (list.cards.length) {
        if (input.position === "end" && lastCard) index = lastCard.index + 1;

        if (input.position === "start") {
          await cardRepo.pushIndex(ctx.db, {
            listId: list.id,
            cardIndex: 0,
          });
        }
      }

      const newCard = await cardRepo.create(ctx.db, {
        title: input.title,
        description: input.description,
        createdBy: userId,
        listId: list.id,
        index,
      });

      const newCardId = newCard?.id;

      if (!newCardId)
        throw new TRPCError({
          message: `Failed to create card`,
          code: "INTERNAL_SERVER_ERROR",
        });

      if (newCardId && input.labelPublicIds.length) {
        const labels = await labelRepo.getAllByPublicIds(
          ctx.db,
          input.labelPublicIds,
        );

        if (!labels?.length)
          throw new TRPCError({
            message: `Labels with public IDs (${input.labelPublicIds.join(", ")}) not found`,
            code: "NOT_FOUND",
          });

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

        if (!members?.length)
          throw new TRPCError({
            message: `Members with public IDs (${input.memberPublicIds.join(", ")}) not found`,
            code: "NOT_FOUND",
          });

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
    .meta({
      openapi: {
        summary: "Add or remove a label from a card",
        method: "PUT",
        path: "/cards/{cardPublicId}/labels/{labelPublicId}",
        description: "Adds or removes a label from a card",
        tags: ["Cards"],
        protect: true,
      },
    })
    .input(
      z.object({
        cardPublicId: z.string().min(12),
        labelPublicId: z.string().min(12),
      }),
    )
    .output(z.object({ newLabel: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const card = await cardRepo.getByPublicId(ctx.db, input.cardPublicId);
      const label = await labelRepo.getByPublicId(ctx.db, input.labelPublicId);

      if (!card)
        throw new TRPCError({
          message: `Card with public ID ${input.cardPublicId} not found`,
          code: "NOT_FOUND",
        });

      if (!label)
        throw new TRPCError({
          message: `Label with public ID ${input.labelPublicId} not found`,
          code: "NOT_FOUND",
        });

      const cardLabelIds = { cardId: card.id, labelId: label.id };

      const existingLabel = await cardRepo.getCardLabelRelationship(
        ctx.db,
        cardLabelIds,
      );

      if (existingLabel) {
        await cardRepo.hardDeleteCardLabelRelationship(ctx.db, cardLabelIds);

        return { newLabel: false };
      }

      await cardRepo.createCardLabelRelationship(ctx.db, cardLabelIds);

      return { newLabel: true };
    }),
  addOrRemoveMember: protectedProcedure
    .meta({
      openapi: {
        summary: "Add or remove a member from a card",
        method: "PUT",
        path: "/cards/{cardPublicId}/members/{workspaceMemberPublicId}",
        description: "Adds or removes a member from a card",
        tags: ["Cards"],
      },
    })
    .input(
      z.object({
        cardPublicId: z.string().min(12),
        workspaceMemberPublicId: z.string().min(12),
      }),
    )
    .output(z.object({ newMember: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const card = await cardRepo.getByPublicId(ctx.db, input.cardPublicId);
      const member = await workspaceRepo.getMemberByPublicId(
        ctx.db,
        input.workspaceMemberPublicId,
      );

      if (!card)
        throw new TRPCError({
          message: `Card with public ID ${input.cardPublicId} not found`,
          code: "NOT_FOUND",
        });

      if (!member)
        throw new TRPCError({
          message: `Member with public ID ${input.workspaceMemberPublicId} not found`,
          code: "NOT_FOUND",
        });

      const cardMemberIds = { cardId: card.id, memberId: member.id };

      const existingMember = await cardRepo.getCardMemberRelationship(
        ctx.db,
        cardMemberIds,
      );

      if (existingMember) {
        await cardRepo.hardDeleteCardMemberRelationship(ctx.db, cardMemberIds);

        return { newMember: false };
      }

      await cardRepo.createCardMemberRelationship(ctx.db, cardMemberIds);

      return { newMember: true };
    }),
  byId: protectedProcedure
    .meta({
      openapi: {
        summary: "Get a card by public ID",
        method: "GET",
        path: "/cards/{cardPublicId}",
        description: "Retrieves a card by its public ID",
        tags: ["Cards"],
        protect: true,
      },
    })
    .input(z.object({ cardPublicId: z.string().min(12) }))
    .output(
      z.custom<
        Awaited<ReturnType<typeof cardRepo.getWithListAndMembersByPublicId>>
      >(),
    )
    .query(async ({ ctx, input }) => {
      const result = await cardRepo.getWithListAndMembersByPublicId(
        ctx.db,
        input.cardPublicId,
      );

      if (!result)
        throw new TRPCError({
          message: `Card with public ID ${input.cardPublicId} not found`,
          code: "NOT_FOUND",
        });

      return result;
    }),
  update: protectedProcedure
    .meta({
      openapi: {
        summary: "Update a card",
        method: "PUT",
        path: "/cards/{cardPublicId}",
        description: "Updates a card by its public ID",
        tags: ["Cards"],
        protect: true,
      },
    })
    .input(
      z.object({
        cardPublicId: z.string().min(12),
        title: z.string().min(1),
        description: z.string(),
      }),
    )
    .output(z.custom<Awaited<ReturnType<typeof cardRepo.update>>>())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const result = await cardRepo.update(
        ctx.db,
        { title: input.title, description: input.description },
        { cardPublicId: input.cardPublicId },
      );

      if (!result)
        throw new TRPCError({
          message: `Failed to update card`,
          code: "INTERNAL_SERVER_ERROR",
        });

      return result;
    }),
  delete: protectedProcedure
    .meta({
      openapi: {
        summary: "Delete a card",
        method: "DELETE",
        path: "/cards/{cardPublicId}",
        description: "Deletes a card by its public ID",
        tags: ["Cards"],
        protect: true,
      },
    })
    .input(
      z.object({
        cardPublicId: z.string().min(12),
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const card = await cardRepo.getCardWithListByPublicId(
        ctx.db,
        input.cardPublicId,
      );

      if (!card?.list?.id)
        throw new TRPCError({
          message: `Card with public ID ${input.cardPublicId} not found`,
          code: "NOT_FOUND",
        });

      const deletedAt = new Date().toISOString();

      await cardRepo.softDelete(ctx.db, {
        cardId: card.id,
        deletedAt,
        deletedBy: userId,
      });

      await cardRepo.shiftIndex(ctx.db, {
        listId: card.list.id,
        cardIndex: card.index,
      });

      return { success: true };
    }),
  reorder: protectedProcedure
    .meta({
      openapi: {
        summary: "Reorder a card",
        method: "PUT",
        path: "/cards/{cardPublicId}/reorder",
        description: "Reorders the position of a card in a given list",
        tags: ["Cards"],
        protect: true,
      },
    })
    .input(
      z.object({
        cardPublicId: z.string().min(12),
        newListPublicId: z.string().min(12),
        newIndex: z.number().optional(),
      }),
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;

      if (!userId)
        throw new TRPCError({
          message: `User not authenticated`,
          code: "UNAUTHORIZED",
        });

      const card = await cardRepo.getCardWithListByPublicId(
        ctx.db,
        input.cardPublicId,
      );

      if (!card?.list)
        throw new TRPCError({
          message: `Card with public ID ${input.cardPublicId} not found`,
          code: "NOT_FOUND",
        });

      const currentList = card.list;
      const currentIndex = card.index;

      let newIndex = input.newIndex;

      const newList = await listRepo.getWithCardsByPublicId(
        ctx.db,
        input.newListPublicId,
      );

      if (!newList)
        throw new TRPCError({
          message: `List with public ID ${input.newListPublicId} not found`,
          code: "NOT_FOUND",
        });

      if (newIndex === undefined) {
        const lastCardIndex = newList.cards.length
          ? newList.cards[0]?.index
          : undefined;

        newIndex = lastCardIndex !== undefined ? lastCardIndex + 1 : 0;
      }

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
