import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";

import type {
  GetBoardByIdOutput,
  NewCardInput,
  NewListInput,
  ReorderCardInput,
  ReorderListInput,
} from "@kan/api/types";
import { generateUID } from "@kan/utils";

import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface BoardContextProps {
  boardData: GetBoardByIdOutput;
  setBoardData: React.Dispatch<React.SetStateAction<GetBoardByIdOutput>>;
  updateList: (params: ReorderListInput) => void;
  updateCard: (params: ReorderCardInput) => void;
  addCard: (params: NewCardInput) => void;
  addList: (params: NewListInput) => void;
  removeCard: (params: { cardPublicId: string }) => void;
  refetchBoard: () => Promise<void>;
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

  const { showPopup } = usePopup();

  const refetchBoard = async () => {
    if (!boardData?.publicId) return;

    try {
      await utils.board.byId.refetch();
    } catch (e) {
      showPopup({
        header: "Error fetching board",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    }
  };

  const updateCardMutation = api.card.reorder.useMutation({
    onSuccess: async () => {
      await refetchBoard();
    },
    onError: async () => {
      await refetchBoard();
      showPopup({
        header: "Unable to update card",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const updateListMutation = api.list.reorder.useMutation({
    onSuccess: async () => {
      await refetchBoard();
    },
    onError: async () => {
      await refetchBoard();
      showPopup({
        header: "Unable to update list",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const addCard = ({
    title,
    listPublicId,
    labelPublicIds,
    memberPublicIds,
    position,
  }: {
    title: string;
    listPublicId: string;
    labelPublicIds: string[];
    memberPublicIds: string[];
    position: "start" | "end";
  }) => {
    if (!boardData) return;

    const updatedLists = boardData.lists.map((list) => {
      if (list.publicId === listPublicId) {
        const newCard = {
          publicId: `PLACEHOLDER_${generateUID()}`,
          title,
          listId: 2,
          description: "",
          labels: boardData.labels.filter((label) =>
            labelPublicIds.includes(label.publicId),
          ),
          members:
            boardData.workspace?.members.filter((member) =>
              memberPublicIds.includes(member.publicId),
            ) ?? [],
          index: position === "start" ? 0 : list.cards.length,
        };

        const updatedCards =
          position === "start"
            ? [newCard, ...list.cards]
            : [...list.cards, newCard];
        return { ...list, cards: updatedCards };
      }
      return list;
    });

    setBoardData({ ...boardData, lists: updatedLists });
  };

  const addList = ({ name, boardPublicId }: NewListInput) => {
    if (!boardData) return;

    const newList = {
      publicId: generateUID(),
      name,
      boardId: 1,
      boardPublicId,
      cards: [],
      index: boardData.lists.length,
    };

    const updatedLists = [...boardData.lists, newList];

    setBoardData({ ...boardData, lists: updatedLists });
  };

  const removeCard = ({ cardPublicId }: { cardPublicId: string }) => {
    if (!boardData) return;

    const updatedLists = boardData.lists.map((list) => {
      const updatedCards = list.cards.filter(
        (card) => card.publicId !== cardPublicId,
      );
      return { ...list, cards: updatedCards };
    });

    setBoardData({ ...boardData, lists: updatedLists });
  };

  const updateList = ({
    listPublicId,
    currentIndex,
    newIndex,
  }: ReorderListInput) => {
    updateListMutation.mutate({
      listPublicId,
      currentIndex,
      newIndex,
    });
  };

  const updateCard = ({
    cardPublicId,
    newListPublicId,
    newIndex,
  }: ReorderCardInput) => {
    updateCardMutation.mutate({
      cardPublicId,
      newListPublicId,
      newIndex,
    });
  };

  return (
    <BoardContext.Provider
      value={{
        boardData,
        setBoardData,
        updateList,
        updateCard,
        addCard,
        addList,
        removeCard,
        refetchBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};
