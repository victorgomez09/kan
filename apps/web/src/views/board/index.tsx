import type { UpdateBoardInput } from "@kan/api/types";
import { t } from "@lingui/core/macro";
import { keepPreviousData } from "@tanstack/react-query";
import { env } from "next-runtime-env";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { DropResult } from "react-beautiful-dnd";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import { HiEllipsisHorizontal, HiLink, HiOutlinePlusSmall, HiOutlineSquare3Stack3D, HiOutlineTrash } from "react-icons/hi2";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { PageHead } from "~/components/PageHead";
import { StrictModeDroppable as Droppable } from "~/components/StrictModeDroppable";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import { formatToArray } from "~/utils/helpers";
import Filters from "./components/Filters";
import List from "./components/List";
import ListCard from "./components/ListCard";
import { NewListForm } from "./components/NewListForm";
import { UpdateBoardSlugForm } from "./components/UpdateBoardSlugForm";
import VisibilityButton from "./components/VisibilityButton";
import { LinkIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "~/components/ui/alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "~/components/ui/alert-dialog";

type PublicListId = string;

export default function BoardPage() {
  const params = useParams() as { boardId: string[] } | null;
  const router = useRouter();
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();
  const [_selectedPublicListId, setSelectedPublicListId] =
    useState<PublicListId>("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const boardId = params?.boardId.length ? params.boardId[0] : null;

  const updateBoard = api.board.update.useMutation();
  const deleteBoard = api.board.delete.useMutation({
    onSuccess: () => {
      router.push(`/boards`);
    },
  });

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

  const queryParams = {
    boardPublicId: boardId ?? "",
    members: formatToArray(router.query.members),
    labels: formatToArray(router.query.labels),
  };

  const {
    data: boardData,
    isSuccess,
    isLoading: isQueryLoading,
  } = api.board.byId.useQuery(queryParams, {
    enabled: !!boardId,
    placeholderData: keepPreviousData,
  });

  const refetchBoard = async () => {
    if (boardId) await utils.board.byId.refetch({ boardPublicId: boardId });
  };

  useEffect(() => {
    if (boardId) {
      setIsInitialLoading(false);
    }
  }, [boardId]);

  const isLoading = isInitialLoading || isQueryLoading;

  const updateListMutation = api.list.update.useMutation({
    onMutate: async (args) => {
      await utils.board.byId.cancel();

      const currentState = utils.board.byId.getData(queryParams);

      utils.board.byId.setData(queryParams, (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const updatedLists = Array.from(oldBoard.lists);

        const sourceList = updatedLists.find(
          (list) => list.publicId === args.listPublicId,
        );

        const currentIndex = sourceList?.index;

        if (currentIndex === undefined) return oldBoard;

        const removedList = updatedLists.splice(currentIndex, 1)[0];

        if (removedList && args.index !== undefined) {
          updatedLists.splice(args.index, 0, removedList);

          return {
            ...oldBoard,
            lists: updatedLists,
          };
        }
      });

      return { previousState: currentState };
    },
    onError: (_error, _newList, context) => {
      utils.board.byId.setData(queryParams, context?.previousState);
      showPopup({
        header: t`Unable to update list`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });

  const updateCardMutation = api.card.update.useMutation({
    onMutate: async (args) => {
      await utils.board.byId.cancel();

      const currentState = utils.board.byId.getData(queryParams);

      utils.board.byId.setData(queryParams, (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const updatedLists = Array.from(oldBoard.lists);

        const sourceList = updatedLists.find((list) =>
          list.cards.some((card) => card.publicId === args.cardPublicId),
        );
        const destinationList = updatedLists.find(
          (list) => list.publicId === args.listPublicId,
        );

        const cardToMove = sourceList?.cards.find(
          (card) => card.publicId === args.cardPublicId,
        );

        if (!cardToMove) return oldBoard;

        const removedCard = sourceList?.cards.splice(cardToMove.index, 1)[0];

        if (
          sourceList &&
          destinationList &&
          removedCard &&
          args.index !== undefined
        ) {
          destinationList.cards.splice(args.index, 0, removedCard);

          return {
            ...oldBoard,
            lists: updatedLists,
          };
        }
      });

      return { previousState: currentState };
    },
    onError: (_error, _newList, context) => {
      utils.board.byId.setData(queryParams, context?.previousState);
      showPopup({
        header: t`Unable to update card`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });

  useEffect(() => {
    if (isSuccess && boardData) {
      setValue("name", boardData.name || "");
    }
  }, [isSuccess, boardData, setValue]);

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
      updateListMutation.mutate({
        listPublicId: draggableId,
        index: destination.index,
      });
    }

    if (type === "CARD") {
      updateCardMutation.mutate({
        cardPublicId: draggableId,

        listPublicId: destination.droppableId,
        index: destination.index,
      });
    }
  };

  return (
    <>
      <PageHead
        title={`${boardData?.name ?? t`Board`} | ${workspace.name ?? t`Workspace`}`}
      />
      <div className="flex flex-col h-[calc(100vh-3em)] w-full">
        <div className="flex w-full flex-col justify-between p-6 md:flex-row md:p-8">
          {isLoading && !boardData && (
            <div className="flex space-x-2">
              <div className="h-[2.3rem] w-[150px] animate-pulse rounded-[5px] bg-light-200 dark:bg-dark-100" />
            </div>
          )}
          {boardData && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="order-2 focus-visible:outline-none md:order-1"
            >
              <input
                id="name"
                type="text"
                {...register("name")}
                onBlur={handleSubmit(onSubmit)}
                className="block border-0 bg-transparent p-0 py-0 font-bold leading-[2.3rem] tracking-tight focus:ring-0 focus-visible:outline-none sm:text-[1.2rem]"
              />
            </form>
          )}
          {!boardData && !isLoading && (
            <p className="order-2 block p-0 py-0 font-bold leading-[2.3rem] tracking-tight sm:text-[1.2rem] md:order-1">
              {t`Board not found`}
            </p>
          )}

          <div className="order-1 mb-4 flex items-center justify-end space-x-2 md:order-2 md:mb-0">
            {/* BOARD LINK */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <LinkIcon
                    className="-mr-0.5 h-5 w-5"
                    aria-hidden="true"
                  />
                  <div className="flex items-center">
                    <span>
                      {env("NEXT_PUBLIC_KAN_ENV") === "cloud"
                        ? "kan.bn"
                        : env("NEXT_PUBLIC_BASE_URL")}
                    </span>
                    <div className="mx-1.5 h-4 w-px rotate-[20deg] bg-gray-300 dark:bg-dark-600"></div>
                    <span>{workspace.slug ?? ""}</span>
                    <div className="mx-1.5 h-4 w-px rotate-[20deg] bg-gray-300 dark:bg-dark-600"></div>
                    <span>{boardData?.slug ?? ""}</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t`Edit board URL`}</DialogTitle>
                </DialogHeader>

                <UpdateBoardSlugForm
                  boardPublicId={boardId ?? ""}
                  workspaceSlug={workspace.slug ?? ""}
                  boardSlug={boardData?.slug ?? ""}
                  queryParams={queryParams}
                />
              </DialogContent>
            </Dialog>

            {/* VISIBILITY */}
            <VisibilityButton
              visibility={boardData?.visibility ?? "private"}
              boardPublicId={boardId ?? ""}
              boardSlug={boardData?.slug ?? ""}
              queryParams={queryParams}
              isLoading={!boardData}
              isAdmin={workspace.role === "admin"}
            />

            {/* FILTERS */}
            <Filters
              labels={boardData?.labels ?? []}
              members={boardData?.workspace.members ?? []}
              position="left"
              isLoading={!boardData}
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <HiOutlinePlusSmall
                    className="-mr-0.5 h-5 w-5"
                    aria-hidden="true"
                  />
                  {t`New list`}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t`New list`}</DialogTitle>
                </DialogHeader>

                <NewListForm
                  boardPublicId={boardId ?? ""}
                  queryParams={queryParams}
                />
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="secondary">
                  <HiEllipsisHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(event) => event.preventDefault()}>
                  <Dialog>
                    <DialogTrigger className="flex items-center gap-2">
                      <HiLink className="h-[16px] w-[16px]" />
                      {t`Edit board URL`}
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t`Edit board URL`}</DialogTitle>
                      </DialogHeader>

                      <UpdateBoardSlugForm
                        boardPublicId={boardId ?? ""}
                        workspaceSlug={workspace.slug ?? ""}
                        boardSlug={boardData?.slug ?? ""}
                        queryParams={queryParams}
                      />
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(event) => event.preventDefault()}>
                  <AlertDialog>
                    <AlertDialogTrigger className="flex items-center gap-1">
                      <HiOutlineTrash className="h-[16px] w-[16px]" />
                      {t`Delete board`}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this board?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {"This action can't be undone."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          deleteBoard.mutate({
                            boardPublicId: boardId!
                          })
                        }}>{t`Delete`}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="h-full flex-1 w-full overflow-x-auto">
          {isLoading ? (
            <div className="ml-[2rem] flex">
              <div className="0 mr-5 h-[500px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
              <div className="0 mr-5 h-[275px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
              <div className="0 mr-5 h-[375px] w-[18rem] animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
            </div>
          ) : boardData ? (
            <>
              {boardData.lists.length === 0 ? (
                <div className="z-10 flex h-full w-full flex-col items-center justify-center space-y-8 pb-[150px]">
                  <div className="flex flex-col items-center">
                    <HiOutlineSquare3Stack3D className="h-10 w-10 dark:text-dark-800" />
                    <p className="mb-2 mt-4 text-[14px] font-bold dark:text-dark-950">
                      {t`No lists`}
                    </p>
                    <p className="text-[14px] text-light-900 dark:text-dark-900">
                      {t`Get started by creating a new list`}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="cursor-pointer">
                        {t`Create new list`}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t`New list`}</DialogTitle>
                      </DialogHeader>

                      <NewListForm
                        boardPublicId={boardId ?? ""}
                        queryParams={queryParams}
                      />
                    </DialogContent>
                  </Dialog>
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
                            <Droppable
                              droppableId={`${list.publicId}`}
                              type="CARD"
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="sz-10 h-full max-h-[calc(100vh-265px)] min-h-[2rem] overflow-y-auto pr-1"
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
                                          className={`mb-2 flex !cursor-pointer flex-col ${card.publicId.startsWith(
                                            "PLACEHOLDER",
                                          )
                                            ? "pointer-events-none"
                                            : ""
                                            }`}
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <ListCard
                                            key={card.publicId}
                                            title={card.title}
                                            labels={card.labels}
                                            members={card.members}
                                          />
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
            </>
          ) : null}
        </div>
      </div>
      {/* <Modal modalSize={modalContentType === "NEW_CARD" ? "md" : "sm"}>
        {modalContentType === "NEW_WORKSPACE" && <NewWorkspaceForm />}
        {modalContentType === "NEW_LABEL" && (
          <LabelForm boardPublicId={boardId ?? ""} refetch={refetchBoard} />
        )}
        {modalContentType === "EDIT_LABEL" && (
          <LabelForm
            boardPublicId={boardId ?? ""}
            refetch={refetchBoard}
            isEdit
          />
        )}
      </Modal> */}
    </>
  );
}
