import type { DropResult } from "react-beautiful-dnd";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import { HiOutlinePlusSmall } from "react-icons/hi2";

import type { UpdateBoardInput } from "@kan/api/types";

import Avatar from "~/components/Avatar";
import Button from "~/components/Button";
import Modal from "~/components/modal";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { PageHead } from "~/components/PageHead";
import PatternedBackground from "~/components/PatternedBackground";
import { StrictModeDroppable as Droppable } from "~/components/StrictModeDroppable";
import { useBoard } from "~/providers/board";
import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import { formatToArray } from "~/utils/helpers";
import createClient from "~/utils/supabase/client";
import { getPublicUrl } from "~/utils/supabase/getPublicUrl";
import BoardDropdown from "./components/BoardDropdown";
import { DeleteBoardConfirmation } from "./components/DeleteBoardConfirmation";
import { DeleteListConfirmation } from "./components/DeleteListConfirmation";
import Filters from "./components/Filters";
import List from "./components/List";
import { NewCardForm } from "./components/NewCardForm";
import { NewListForm } from "./components/NewListForm";
import { UpdateBoardSlugForm } from "./components/UpdateBoardSlugForm";
import VisibilityButton from "./components/VisibilityButton";

type PublicListId = string;

export default function BoardPage() {
  const supabase = createClient();
  const params = useParams() as { boardId: string[] } | null;
  const router = useRouter();
  const { boardData, setBoardData, updateCard, updateList } = useBoard();
  const { workspace } = useWorkspace();
  const { openModal, modalContentType } = useModal();
  const [selectedPublicListId, setSelectedPublicListId] =
    useState<PublicListId>("");

  const boardId = params?.boardId.length ? params.boardId[0] : null;

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
      members: formatToArray(router.query.members),
      labels: formatToArray(router.query.labels),
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
        listPublicId: draggableId,
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
        cardPublicId: draggableId,
        newListPublicId: destination.droppableId,
        newIndex: destination.index,
      });
    }
  };

  return (
    <>
      <PageHead
        title={`${boardData.name ?? "Board"} | ${workspace.name ?? "Workspace"}`}
      />
      <div className="relative flex h-full flex-col">
        <PatternedBackground />
        <div className="z-10 flex w-full justify-between p-8">
          {isLoading ? (
            <div className="flex space-x-2">
              <div className="h-[2.3rem] w-[150px] animate-pulse rounded-[5px] bg-light-200 dark:bg-dark-100" />
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
                className="block border-0 bg-transparent p-0 py-0 font-bold leading-[2.3rem] tracking-tight text-neutral-900 focus:ring-0 focus-visible:outline-none dark:text-dark-1000 sm:text-[1.2rem]"
              />
            </form>
          )}

          <div className="flex items-center space-x-2">
            <VisibilityButton
              visibility={boardData.visibility}
              boardPublicId={boardId}
            />
            <Filters boardData={boardData} position="left" />
            <Button
              iconLeft={
                <HiOutlinePlusSmall
                  className="-mr-0.5 h-5 w-5"
                  aria-hidden="true"
                />
              }
              onClick={() => openNewListForm(boardId)}
            >
              New list
            </Button>
            <BoardDropdown />
          </div>
        </div>

        <div className="scrollbar-w-none scrollbar-track-rounded-[4px] scrollbar-thumb-rounded-[4px] scrollbar-h-[8px] z-0 flex-1 overflow-y-hidden overflow-x-scroll overscroll-contain scrollbar scrollbar-track-light-200 scrollbar-thumb-light-400 dark:scrollbar-track-dark-100 dark:scrollbar-thumb-dark-300">
          {isLoading ? (
            <div className="ml-[2rem] flex">
              <div className="0 mr-5 h-[500px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
              <div className="0 mr-5 h-[275px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
              <div className="0 mr-5 h-[375px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
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
                    {boardData.lists.map((list, index) => (
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
                              className="scrollbar-track-rounded-[4px] scrollbar-thumb-rounded-[4px] scrollbar-w-[8px] z-10 h-full max-h-[calc(100vh-265px)] min-h-[2rem] overflow-y-auto pr-1 scrollbar scrollbar-track-dark-100 scrollbar-thumb-dark-600"
                            >
                              {list.cards.map((card, index) => (
                                <Draggable
                                  key={card.publicId}
                                  draggableId={card.publicId}
                                  index={index}
                                >
                                  {(provided) => (
                                    <Link
                                      onClick={(e) => {
                                        if (
                                          card.publicId.startsWith(
                                            "PLACEHOLDER",
                                          )
                                        )
                                          e.preventDefault();
                                      }}
                                      key={card.publicId}
                                      href={`/cards/${card.publicId}`}
                                      className={`mb-2 flex !cursor-pointer flex-col rounded-md border border-light-200 bg-light-50 px-3 py-2 text-sm text-neutral-900 dark:border-dark-200 dark:bg-dark-200 dark:text-dark-1000 dark:hover:bg-dark-300 ${
                                        card.publicId.startsWith("PLACEHOLDER")
                                          ? "pointer-events-none"
                                          : ""
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <div>{card.title}</div>
                                      {(card.labels.length ?? 0) ||
                                      (card.members.length ?? 0) ? (
                                        <div className="mt-2 flex justify-end space-x-1">
                                          {card.labels.map((label) => (
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
                                            {card.members.map((member) => {
                                              const fileName =
                                                member.user?.image;

                                              const avatarUrl = fileName
                                                ? getPublicUrl(fileName)
                                                : undefined;

                                              return (
                                                <Avatar
                                                  key={member.publicId}
                                                  name={member.user?.name ?? ""}
                                                  email={
                                                    member.user?.email ?? ""
                                                  }
                                                  imageUrl={avatarUrl}
                                                  size="sm"
                                                />
                                              );
                                            })}
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
          {modalContentType === "UPDATE_BOARD_SLUG" && (
            <UpdateBoardSlugForm
              boardPublicId={boardId}
              workspaceSlug={workspace.slug}
              boardSlug={boardData.slug}
            />
          )}
        </Modal>
      </div>
    </>
  );
}
