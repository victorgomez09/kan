import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import { HiOutlinePlusSmall } from "react-icons/hi2";
import {
  DragDropContext,
  Droppable,
  type DropResult,
  Draggable,
} from "react-beautiful-dnd";
import { useForm } from "react-hook-form";

import { api } from "~/utils/api";
import { useBoard } from "~/providers/board";
import { useModal } from "~/providers/modal";

import Modal from "~/components/modal";
import PatternedBackground from "~/components/PatternedBackground";

import BoardDropdown from "./components/BoardDropdown";
import { DeleteBoardConfirmation } from "./components/DeleteBoardConfirmation";
import { DeleteListConfirmation } from "./components/DeleteListConfirmation";
import List from "./components/List";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { NewCardForm } from "./components/NewCardForm";
import { NewListForm } from "./components/NewListForm";
import Filters from "./components/Filters";

import { type UpdateBoardInput } from "~/types/router.types";

type PublicListId = string;

const formatToArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined);
  }
  return value ? [value] : [];
};

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const { boardData, setBoardData, updateCard, updateList } = useBoard();
  const { openModal, modalContentType } = useModal();
  const [selectedPublicListId, setSelectedPublicListId] =
    useState<PublicListId>("");

  const boardId = params?.boardId?.length ? params.boardId[0] : null;

  const updateBoard = api.board.update.useMutation();

  const { register, handleSubmit, setValue } = useForm<UpdateBoardInput>({
    values: {
      boardPublicId: boardId ?? "",
      name: "",
    },
  });

  const onSubmit = (values: UpdateBoardInput) => {
    updateBoard.mutate({
      boardPublicId: values.boardPublicId,
      name: values.name,
    });
  };

  const { data, isSuccess, isLoading } = api.board.byId.useQuery(
    {
      boardPublicId: boardId ?? "",
      filters: {
        members: formatToArray(router.query.members),
        labels: formatToArray(router.query.labels),
      },
    },
    {
      enabled: !!boardId,
    },
  );

  useEffect(() => {
    if (isSuccess && data) {
      setBoardData(data);
      setValue("name", data.name || "");
    }
  }, [isSuccess, data, setBoardData, setValue]);

  if (!boardId || !boardData) return <></>;

  const openNewListForm = (publicBoardId: string) => {
    openModal("NEW_LIST");
    setSelectedPublicListId(publicBoardId);
  };

  const onDragEnd = ({
    source,
    destination,
    draggableId,
    type,
  }: DropResult): void => {
    if (!destination) {
      return;
    }

    if (type === "LIST") {
      const updatedLists = Array.from(boardData.lists);
      const removedList = updatedLists.splice(source.index, 1)[0];

      if (removedList) {
        updatedLists.splice(destination.index, 0, removedList);

        setBoardData({ ...boardData, lists: updatedLists });
      }

      updateList({
        boardId,
        listId: draggableId,
        currentIndex: source.index,
        newIndex: destination.index,
      });
    }

    if (type === "CARD") {
      const updatedLists = Array.from(boardData.lists);
      const sourceList = updatedLists.find(
        (list) => list.publicId === source.droppableId,
      );
      const destinationList = updatedLists.find(
        (list) => list.publicId === destination.droppableId,
      );
      const removedCard = sourceList?.cards.splice(source.index, 1)[0];

      if (sourceList && destinationList && removedCard) {
        destinationList.cards.splice(destination.index, 0, removedCard);

        setBoardData({ ...boardData, lists: updatedLists });
      }

      updateCard({
        cardId: draggableId,
        newListId: destination.droppableId,
        newIndex: destination.index,
      });
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      <PatternedBackground />
      <div className="z-10 flex w-full justify-between p-8">
        {isLoading ? (
          <div className="flex space-x-2">
            <div className="h-[2.3rem] w-[150px] animate-pulse rounded-[5px] bg-light-200 dark:bg-dark-200" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="focus-visible:outline-none"
          >
            <input
              id="name"
              type="text"
              {...register("name")}
              onBlur={handleSubmit(onSubmit)}
              className="block border-0 bg-transparent p-0 py-0 font-medium leading-[2.3rem] tracking-tight text-neutral-900 focus:ring-0 focus-visible:outline-none dark:text-dark-1000 sm:text-[1.2rem]"
            />
          </form>
        )}

        <div className="flex items-center space-x-2">
          <Filters />
          <button
            type="button"
            className="mr-2 inline-flex items-center gap-x-1.5 rounded-md bg-light-1000 px-3 py-2 text-sm font-semibold text-light-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-dark-1000 dark:text-dark-50"
            onClick={() => openNewListForm(boardId)}
          >
            <HiOutlinePlusSmall
              className="-mr-0.5 h-5 w-5"
              aria-hidden="true"
            />
            New list
          </button>
          <BoardDropdown />
        </div>
      </div>

      <div className="scrollbar-w-none z-0 flex-1 overflow-y-hidden overflow-x-scroll overscroll-contain scrollbar scrollbar-track-light-200 scrollbar-thumb-light-400 scrollbar-track-rounded-[4px] scrollbar-thumb-rounded-[4px] scrollbar-h-[8px] dark:scrollbar-track-dark-100 dark:scrollbar-thumb-dark-300">
        {isLoading ? (
          <div className="ml-[2rem] flex">
            <div className="0 mr-5 h-[500px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-200" />
            <div className="0 mr-5 h-[275px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-200" />
            <div className="0 mr-5 h-[375px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-200" />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="all-lists"
              direction="horizontal"
              type="LIST"
            >
              {(provided) => (
                <div
                  className="flex"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="min-w-[2rem]" />
                  {boardData?.lists?.map((list, index) => (
                    <List
                      index={index}
                      key={index}
                      list={list}
                      setSelectedPublicListId={(publicListId) =>
                        setSelectedPublicListId(publicListId)
                      }
                    >
                      <Droppable droppableId={`${list.publicId}`} type="CARD">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="z-10 h-full max-h-[calc(100vh-265px)] min-h-[2rem] overflow-y-auto pr-1 scrollbar scrollbar-track-dark-100 scrollbar-thumb-dark-600 scrollbar-track-rounded-[4px] scrollbar-thumb-rounded-[4px] scrollbar-w-[8px]"
                          >
                            {list.cards?.map((card, index) => (
                              <Draggable
                                key={card.publicId}
                                draggableId={card.publicId}
                                index={index}
                              >
                                {(provided) => (
                                  <Link
                                    onClick={(e) => {
                                      if (
                                        card.publicId.startsWith("PLACEHOLDER")
                                      )
                                        e.preventDefault();
                                    }}
                                    key={card.publicId}
                                    href={`/cards/${card.publicId}`}
                                    className={`mb-2 flex !cursor-pointer flex-col rounded-md border border-light-200 bg-light-50 px-3 py-2 text-sm text-neutral-900 dark:border-dark-200 dark:bg-dark-300 dark:text-dark-1000 dark:hover:bg-dark-400 ${
                                      card.publicId.startsWith("PLACEHOLDER")
                                        ? "pointer-events-none"
                                        : ""
                                    }`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <div>{card.title}</div>
                                    {(card.labels?.length ?? 0) ||
                                    (card.members?.length ?? 0) ? (
                                      <div className="mt-2 flex justify-end space-x-1">
                                        {card.labels?.map((label) => (
                                          <span
                                            key={label.publicId}
                                            className="inline-flex w-fit items-center gap-x-1.5 rounded-full px-2 py-1 text-[10px] font-medium text-neutral-600 ring-1 ring-inset ring-light-600 dark:text-dark-1000 dark:ring-dark-800"
                                          >
                                            <svg
                                              fill={
                                                label.colourCode ?? undefined
                                              }
                                              className="h-2 w-2"
                                              viewBox="0 0 6 6"
                                              aria-hidden="true"
                                            >
                                              <circle cx={3} cy={3} r={3} />
                                            </svg>
                                            <div>{label.name}</div>
                                          </span>
                                        ))}
                                        <div className="isolate flex -space-x-1 overflow-hidden">
                                          {card.members?.map((member) => (
                                            <span
                                              key={member.publicId}
                                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-light-900 ring-2 ring-light-50 dark:bg-gray-500 dark:ring-dark-500"
                                            >
                                              <span className="text-[10px] font-medium leading-none text-white">
                                                {member?.user?.name
                                                  ?.split(" ")
                                                  .map((namePart) =>
                                                    namePart
                                                      .charAt(0)
                                                      .toUpperCase(),
                                                  )
                                                  .join("")}
                                              </span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}
                                  </Link>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </List>
                  ))}
                  <div className="min-w-[0.75rem]" />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      <Modal modalSize={modalContentType === "NEW_CARD" ? "md" : "sm"}>
        {modalContentType === "DELETE_BOARD" && <DeleteBoardConfirmation />}
        {modalContentType === "DELETE_LIST" && (
          <DeleteListConfirmation listPublicId={selectedPublicListId} />
        )}
        {modalContentType === "NEW_CARD" && (
          <NewCardForm listPublicId={selectedPublicListId} />
        )}
        {modalContentType === "NEW_LIST" && (
          <NewListForm boardPublicId={boardId} />
        )}
        {modalContentType === "NEW_WORKSPACE" && <NewWorkspaceForm />}
      </Modal>
    </div>
  );
}
