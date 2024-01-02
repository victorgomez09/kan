"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HiOutlinePlusSmall } from "react-icons/hi2";
import {
  DragDropContext,
  Droppable,
  type DropResult,
  Draggable,
} from "react-beautiful-dnd";
import { useFormik } from "formik";

import { api } from "~/trpc/react";
import { useBoard } from "~/app/providers/board";
import { useModal } from "~/app/providers/modal";

import Modal from "~/app/_components/modal";

import BoardDropdown from "./components/BoardDropdown";
import { DeleteBoardConfirmation } from "./components/DeleteBoardConfirmation";
import { DeleteListConfirmation } from "./components/DeleteListConfirmation";
import List from "./components/List";
import { NewCardForm } from "./components/NewCardForm";
import { NewListForm } from "./components/NewListForm";

interface List {
  publicId: string;
  name: string;
  cards?: Card[];
}

interface Card {
  publicId: string;
  title: string;
  labels?: Label[];
}

interface Label {
  label: LabelData;
}

interface LabelData {
  publicId: string;
  name: string;
  colourCode: string;
}

interface FormValues {
  boardId: string;
  name: string;
}

type PublicListId = string;

export default function BoardPage() {
  const params = useParams();
  const { boardData, setBoardData, updateCard, updateList } = useBoard();
  const { openModal, modalContentType } = useModal();
  const [selectedPublicListId, setSelectedPublicListId] =
    useState<PublicListId>("");

  const boardId = params?.id?.length ? params.id[0] : null;

  const updateBoard = api.board.update.useMutation();

  const formik = useFormik({
    initialValues: {
      boardId: boardId ?? "",
      name: boardData?.name ? boardData.name : "",
    },
    onSubmit: (values: FormValues) => {
      updateBoard.mutate({
        boardId: values.boardId,
        name: values.name,
      });
    },
    enableReinitialize: true,
  });

  if (!boardId) return <></>;

  api.board.byId.useQuery(
    { id: boardId },
    {
      onSuccess: (data) => {
        if (data) setBoardData(data);
      },
    },
  );

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
        currentListId: source.droppableId,
        newListId: destination.droppableId,
        currentIndex: source.index,
        newIndex: destination.index,
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full justify-between p-8">
        <form
          onSubmit={formik.handleSubmit}
          className="focus-visible:outline-none"
        >
          <input
            type="name"
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.submitForm}
            className="block border-0 bg-transparent p-0 py-1.5 font-medium tracking-tight text-dark-1000 focus:ring-0 focus-visible:outline-none sm:text-[1.2rem] sm:leading-6"
          />
        </form>
        <div className="flex items-center">
          <button
            type="button"
            className="mr-2 inline-flex items-center gap-x-1.5 rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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

      <div className="scrollbar-thumb-rounded-[4px] scrollbar-track-rounded-[4px] scrollbar-w-none scrollbar-h-[8px] scrollbar scrollbar-thumb-dark-300 scrollbar-track-dark-100 flex-1 overflow-y-hidden overflow-x-scroll overscroll-contain pb-5">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
            {(provided) => (
              <div
                className="flex"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className="min-w-[2rem]" />
                {boardData?.lists?.map((list: List, index) => (
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
                          className="scrollbar-thumb-rounded-[4px] scrollbar-track-rounded-[4px] scrollbar-w-[8px] scrollbar scrollbar-thumb-dark-600 scrollbar-track-dark-100 h-full max-h-[calc(100vh-250px)] min-h-[2rem] overflow-y-auto pr-1"
                        >
                          {list.cards?.map((card, index) => (
                            <Draggable
                              key={card.publicId}
                              draggableId={card.publicId}
                              index={index}
                            >
                              {(provided) => (
                                <Link
                                  key={card.publicId}
                                  href={`/cards/${card.publicId}`}
                                  className="mb-2 flex !cursor-pointer flex-col rounded-md border border-dark-200 bg-dark-500 px-3 py-2 text-sm text-dark-1000"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div>{card.title}</div>
                                  {card.labels?.length ? (
                                    <div className="mt-2 flex justify-end space-x-1">
                                      {card.labels.map(({ label }) => (
                                        <span
                                          key={label.publicId}
                                          className="inline-flex w-fit items-center gap-x-1.5 rounded-full px-2 py-1 text-[10px] font-medium text-dark-1000 ring-1 ring-inset ring-dark-800"
                                        >
                                          <svg
                                            fill={label.colourCode}
                                            className="h-2 w-2"
                                            viewBox="0 0 6 6"
                                            aria-hidden="true"
                                          >
                                            <circle cx={3} cy={3} r={3} />
                                          </svg>
                                          <div>{label.name}</div>
                                        </span>
                                      ))}
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
      </div>
      <Modal>
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
      </Modal>
    </div>
  );
}
