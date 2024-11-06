import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { generateUID } from "~/utils/generateUID";

import * as boardRepo from "~/server/db/repository/board.repo";
import * as cardRepo from "~/server/db/repository/card.repo";
import * as cardActivityRepo from "~/server/db/repository/cardActivity.repo";
import * as importRepo from "~/server/db/repository/import.repo";
import * as listRepo from "~/server/db/repository/list.repo";
import * as workspaceRepo from "~/server/db/repository/workspace.repo";

const TRELLO_API_URL = "https://api.trello.com/1";

interface TrelloBoard {
  id: string;
  name: string;
  lists: TrelloList[];
  cards: TrelloCard[];
}

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
}

interface MemberData {
  idBoards: string[];
}

export const importRouter = createTRPCRouter({
  trello: createTRPCRouter({
    getBoards: protectedProcedure
      .meta({
        openapi: {
          summary: "Get boards from Trello",
          method: "GET",
          path: "/imports/trello/boards",
          description: "Retrieves all boards from Trello",
          tags: ["Imports"],
          protect: true,
        },
      })
      .input(
        z.object({
          apiKey: z.string().length(32),
          token: z.string().length(76),
        }),
      )
      .output(z.array(z.object({ id: z.string(), name: z.string() })))
      .query(async ({ input }) => {
        const fetchMemberRes = await fetch(
          `${TRELLO_API_URL}/tokens/${input.token}/member?key=${input.apiKey}`,
        );

        const member = (await fetchMemberRes.json()) as MemberData;

        const boardIds = member.idBoards;

        const fetchBoard = async (boardId: string) => {
          try {
            const response = await fetch(
              `${TRELLO_API_URL}/boards/${boardId}?key=${input.apiKey}&token=${input.token}`,
            );
            const data = (await response.json()) as TrelloBoard;

            return data;
          } catch (error) {
            throw error;
          }
        };

        const boards = [];

        for (const boardId of boardIds) {
          boards.push(Promise.resolve(fetchBoard(boardId)));
        }

        const boardDataArray = await Promise.all(boards);

        return boardDataArray.map((board) => ({
          id: board.id,
          name: board.name,
        }));
      }),
    importBoards: protectedProcedure
      .meta({
        openapi: {
          summary: "Import boards from Trello",
          method: "POST",
          path: "/imports/trello/import",
          description: "Imports boards from Trello",
          tags: ["Imports"],
          protect: true,
        },
      })
      .input(
        z.object({
          boardIds: z.array(z.string()),
          apiKey: z.string().length(32),
          token: z.string().length(76),
          workspacePublicId: z.string().min(12),
        }),
      )
      .output(z.object({ boardsCreated: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id;

        if (!userId)
          throw new TRPCError({
            message: `User not authenticated`,
            code: "UNAUTHORIZED",
          });

        const newImport = await importRepo.create(ctx.db, {
          source: "trello",
          createdBy: userId,
        });

        const newImportId = newImport?.id;

        let boardsCreated = 0;

        const workspace = await workspaceRepo.getByPublicId(
          ctx.db,
          input.workspacePublicId,
        );

        if (!workspace)
          throw new TRPCError({
            message: `Workspace with public ID ${input.workspacePublicId} not found`,
            code: "NOT_FOUND",
          });

        for (const boardId of input.boardIds) {
          const response = await fetch(
            `${TRELLO_API_URL}/boards/${boardId}?key=${input.apiKey}&token=${input.token}&lists=open&cards=open`,
          );
          const data = (await response.json()) as TrelloBoard;

          const formattedData = {
            name: data.name,
            lists: data.lists.map((list) => ({
              name: list.name,
              cards: data.cards
                .filter((card) => card.idList === list.id)
                .map((_card) => ({
                  name: _card.name,
                  description: _card.desc,
                })),
            })),
          };

          const newBoard = await boardRepo.create(ctx.db, {
            name: formattedData.name,
            createdBy: userId,
            importId: newImportId,
            workspaceId: workspace.id,
          });

          const newBoardId = newBoard?.id;

          if (!newBoardId)
            throw new TRPCError({
              message: "Failed to create new board",
              code: "INTERNAL_SERVER_ERROR",
            });

          let listIndex = 0;

          for (const list of formattedData.lists) {
            const newList = await listRepo.create(ctx.db, {
              name: list.name,
              createdBy: userId,
              boardId: newBoardId,
              index: listIndex,
              importId: newImportId,
            });

            const newListId = newList?.id;

            if (list.cards.length && newListId) {
              const cardsInsert = list.cards.map((card, index) => ({
                publicId: generateUID(),
                title: card.name,
                description: card.description,
                createdBy: userId,
                listId: newListId,
                index,
                importId: newImportId,
              }));

              const createdCards = await cardRepo.bulkCreate(
                ctx.db,
                cardsInsert,
              );

              if (!createdCards?.length)
                throw new TRPCError({
                  message: "Failed to create new cards",
                  code: "INTERNAL_SERVER_ERROR",
                });

              const activities = createdCards.map((card) => ({
                type: "card.created" as const,
                cardId: card.id,
                createdBy: userId,
              }));

              if (createdCards.length > 0) {
                await cardActivityRepo.bulkCreate(ctx.db, activities);
              }
            }

            listIndex++;
          }
          boardsCreated++;
        }

        if (boardsCreated > 0 && newImportId) {
          await importRepo.update(
            ctx.db,
            { status: "success" },
            { importId: newImport.id },
          );
        }

        return { boardsCreated };
      }),
  }),
});
