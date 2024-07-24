import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { api } from "~/utils/api";

import {
  GetBoardByIdOutput,
  ReorderCardInput,
  ReorderListInput,
} from "~/types/router.types";

interface BoardContextProps {
  boardData: GetBoardByIdOutput;
  setBoardData: React.Dispatch<React.SetStateAction<GetBoardByIdOutput>>;
  updateList: (params: ReorderListInput) => void;
  updateCard: (params: ReorderCardInput) => void;
}

const initialBoardData: GetBoardByIdOutput = {
  name: "",
  publicId: "",
  lists: [],
  labels: [],
  workspace: {
    publicId: "",
    members: [],
  },
};

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const BoardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const utils = api.useUtils();
  const [boardData, setBoardData] =
    useState<GetBoardByIdOutput>(initialBoardData);

  const refetchBoard = () => {
    if (boardData?.publicId)
      utils.board.byId.refetch({ boardPublicId: boardData.publicId });
  };

  const updateCardMutation = api.card.reorder.useMutation({
    onSuccess: async () => {
      try {
        await refetchBoard();
      } catch (e) {
        console.log(e);
      }
    },
  });

  const updateListMutation = api.list.reorder.useMutation({
    onSuccess: async () => {
      try {
        await refetchBoard();
      } catch (e) {
        console.log(e);
      }
    },
  });

  const updateList = ({
    boardId,
    listId,
    currentIndex,
    newIndex,
  }: ReorderListInput) => {
    updateListMutation.mutate({
      boardId,
      listId,
      currentIndex,
      newIndex,
    });
  };

  const updateCard = ({ cardId, newListId, newIndex }: ReorderCardInput) => {
    updateCardMutation.mutate({
      cardId,
      newListId,
      newIndex,
    });
  };

  return (
    <BoardContext.Provider
      value={{ boardData, setBoardData, updateList, updateCard }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = (): BoardContextProps => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};
