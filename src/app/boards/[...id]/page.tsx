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
import { NewCardForm } from "~/app/boards/[...id]/create";

interface List {
  publicId: string;
  name: string;
  cards?: Card[];
}

interface Card {
  publicId: string;
  title: string;
}

interface FormValues {
  boardId: string;
  name: string;
}

type PublicListId = string;

export default function BoardPage() {
  const params = useParams();
  const { boardData, setBoardData, updateCard, updateList } = useBoard();
  const { openModal } = useModal();
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

  const openNewCardForm = (publicListId: PublicListId) => {
    openModal();
    setSelectedPublicListId(publicListId);
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
    <div>
      <div className="mb-8 flex w-full justify-between">
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
        <div>
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <HiOutlinePlusSmall
              className="-mr-0.5 h-5 w-5"
              aria-hidden="true"
            />
            New list
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              className="flex"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {boardData?.lists?.map((list: List, index) => (
                <Draggable
                  key={list.publicId}
                  draggableId={list.publicId}
                  index={index}
                >
                  {(provided) => (
                    <div
                      key={list.publicId}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mr-5 w-72 rounded-md border border-dark-400 bg-dark-200 px-2 py-2"
                    >
                      <div className="flex justify-between">
                        <p className="mb-4 px-4 pt-1 text-sm font-medium text-dark-1000">
                          {list.name}
                        </p>
                        <button
                          className="mx-1 inline-flex h-fit items-center rounded-md p-1 px-1 text-sm font-semibold text-dark-50 hover:bg-dark-400"
                          onClick={() => openNewCardForm(list.publicId)}
                        >
                          <HiOutlinePlusSmall
                            className="h-5 w-5 text-dark-900"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      <Droppable droppableId={`${list.publicId}`} type="CARD">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="h-full"
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
                                    className="mb-2 flex !cursor-pointer rounded-md border border-dark-200 bg-dark-500 px-3 py-2 text-sm text-dark-1000"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    {card.title}
                                  </Link>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Modal>
        <NewCardForm listPublicId={selectedPublicListId} />
      </Modal>
    </div>
  );
}
