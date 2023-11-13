"use client";

import { useParams } from "next/navigation";
import { HiOutlinePlusSmall } from "react-icons/hi2";
import {
  DragDropContext,
  Droppable,
  type DropResult,
  Draggable,
} from "react-beautiful-dnd";

import { api } from "~/trpc/react";

interface List {
  publicId: string;
  name: string;
  cards?: Card[];
}

interface Card {
  publicId: string;
  title: string;
}

export default function BoardPage() {
  const params = useParams();
  const utils = api.useUtils();

  const boardId = params?.id?.length && params.id[0];

  if (!boardId) return <></>;

  const { data } = api.board.byId.useQuery({ id: boardId });

  const refetchBoard = () => utils.board.byId.refetch({ id: boardId });

  const updateCard = api.card.update.useMutation({
    onSuccess: async () => {
      try {
        await refetchBoard();
      } catch (e) {
        console.log(e);
      }
    },
  });

  const onDragEnd = ({
    source,
    destination,
    draggableId,
  }: DropResult): void => {
    if (!destination) {
      return;
    }

    updateCard.mutate({
      cardId: draggableId,
      currentListId: source.droppableId,
      newListId: destination.droppableId,
      currentIndex: source.index,
      newIndex: destination.index,
    });
  };

  return (
    <div>
      <div className="mb-8 flex w-full justify-between">
        <h1 className="font-medium tracking-tight text-dark-1000 sm:text-[1.2rem]">
          {data?.name}
        </h1>
        <div>
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <HiOutlinePlusSmall
              className="-mr-0.5 h-5 w-5"
              aria-hidden="true"
            />
            New
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex">
          {data?.lists.map((list: List) => (
            <Droppable key={list.publicId} droppableId={`${list.publicId}`}>
              {(provided) => (
                <div
                  key={list.publicId}
                  className="mr-5 w-72 rounded-md border border-dark-400 bg-dark-200 px-2 py-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <p className="mb-4 px-4 text-sm font-medium text-dark-1000">
                    {list.name}
                  </p>

                  {list.cards?.map((card, index) => (
                    <Draggable
                      key={card.publicId}
                      draggableId={card.publicId}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          key={card.publicId}
                          className="mb-2 rounded-md border border-dark-200 bg-dark-500 px-3 py-2"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <p className="text-sm text-dark-1000">{card.title}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
