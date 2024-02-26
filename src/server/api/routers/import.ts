import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { boards, cards, imports,  lists } from "~/server/db/schema";
import { generateUID } from "~/utils/generateUID";

const TRELLO_API_URL = 'https://api.trello.com/1';

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
    getBoards: publicProcedure
      .input(
        z.object({
          apiKey: z.string().length(32),
          token: z.string().length(76),
        }),
      )
      .query(async ({ ctx, input }) => {
        const userId = ctx.session?.user.id;
  
        if (!userId) return;

        const fetchMemberRes = await fetch(`${TRELLO_API_URL}/tokens/${input.token}/member?key=${input.apiKey}`)

        const member = await fetchMemberRes.json() as MemberData;

        const boardIds = member.idBoards;

        const fetchBoard = async (boardId: string) => {
          try {
            const response = await fetch(`${TRELLO_API_URL}/boards/${boardId}?key=${input.apiKey}&token=${input.token}`);
            const data = await response.json() as TrelloBoard;
        
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
        
        return boardDataArray.map((board) => ({ id: board.id, name: board.name }));
      }),
    importBoards: publicProcedure
      .input(
        z.object({
          boardIds: z.array(z.string()),
          apiKey: z.string().length(32),
          token: z.string().length(76),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.session?.user.id;
  
        if (!userId) return;

        const newImport = await ctx.db.insert(imports).values({
          publicId: generateUID(),
          source: 'trello',
          createdBy: userId,
          status: 'started'
        })

        let boardsCreated = 0;

        for (const boardId of input.boardIds) {
          const response = await fetch(`${TRELLO_API_URL}/boards/${boardId}?key=${input.apiKey}&token=${input.token}&lists=open&cards=open`);
          const data = await response.json() as TrelloBoard;

          const formattedData = {
            name: data.name,
            lists: data.lists.map((list) => ({
              name: list.name,
              cards: data.cards
                .filter((card) => card.idList === list.id)
                .map((_card) => ({
                  name: _card.name,
                  description: _card.desc
                }))
            }))
          }

          await ctx.db.transaction(async (tx) => {
            const newBoard = await tx.insert(boards).values({
              publicId: generateUID(),
              name: data.name,
              createdBy: userId,
              importId: newImport.insertId
            });

            if (!newBoard?.insertId) return;

            let listIndex = 0;

            for (const list of formattedData.lists) {
              const newList = await tx.insert(lists).values({
                publicId: generateUID(),
                name: list.name,
                createdBy: userId,
                boardId: Number(newBoard.insertId),
                index: listIndex,
                importId: newImport.insertId
              });

              if (list.cards.length) {
                const cardsInsert = list.cards.map((card, index) => ({ 
                  publicId: generateUID(),
                  title: card.name,
                  description: card.description,
                  createdBy: userId,
                  listId: Number(newList.insertId),
                  index,
                  importId: newImport.insertId
                }))

                await tx.insert(cards).values(cardsInsert);
              }

              listIndex ++
            }
          })

          boardsCreated ++
        }

        if (boardsCreated > 0) {
          await ctx.db.update(imports)
            .set({ status: 'success' })
            .where(eq(imports.id, Number(newImport.insertId)))
        }

        return { boardsCreated }
      }),
  })
});