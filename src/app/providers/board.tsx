"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { api } from "~/trpc/react";

interface BoardContextProps {
  boardData: BoardData;
  setBoardData: React.Dispatch<React.SetStateAction<BoardData>>;
  updateList: (params: UpdateListParams) => void;
  updateCard: (params: UpdateCardParams) => void;
}

interface BoardData {
  name: string;
  publicId: string;
  lists: List[];
}

interface List {
  publicId: string;
  name: string;
  boardId: number;
  index: number;
  cards: Card[];
}

interface Card {
  publicId: string;
  title: string;
}

interface UpdateListParams {
  boardId: string;
  listId: string;
  currentIndex: number;
  newIndex: number;
}

interface UpdateCardParams {
  cardId: string;
  currentListId: string;
  newListId: string;
  currentIndex: number;
  newIndex: number;
}

const initialBoardData: BoardData = {
  name: "",
  publicId: "",
  lists: [],
};

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const BoardProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const utils = api.useUtils();
  const [boardData, setBoardData] = useState<BoardData>(initialBoardData);

  const refetchBoard = () =>
    utils.board.byId.refetch({ id: boardData.publicId });

  const updateCardMutation = api.card.reorder.useMutation({
    onSuccess: async () => {
      try {
        await refetchBoard();
      } catch (e) {
        console.log(e);
      }
    },
  });

  const updateListMutation = api.list.update.useMutation({
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
  }: UpdateListParams) => {
    updateListMutation.mutate({
      boardId,
      listId,
      currentIndex,
      newIndex,
    });
  };

  const updateCard = ({
    cardId,
    currentListId,
    newListId,
    currentIndex,
    newIndex,
  }: UpdateCardParams) => {
    updateCardMutation.mutate({
      cardId,
      currentListId,
      newListId,
      currentIndex,
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
