import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

const TRELLO_API_URL = 'https://api.trello.com/1';

interface BoardData {
  id: string;
  name: string;
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

        console.log({ input })

        const fetchMemberRes = await fetch(`${TRELLO_API_URL}/tokens/${input.token}/member?key=${input.apiKey}`)

        const member = await fetchMemberRes.json() as MemberData;

        const boardIds = member.idBoards;

        const fetchBoard = async (boardId: string) => {
          try {
            const response = await fetch(`${TRELLO_API_URL}/boards/${boardId}?key=${input.apiKey}&token=${input.token}`);
            const data = await response.json() as BoardData;
        
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
  })
});