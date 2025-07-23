import { t } from "@lingui/core/macro";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { IoChevronForwardSharp } from "react-icons/io5";
import Editor from "~/components/Editor";
import LabelIcon from "~/components/LabelIcon";
import { PageHead } from "~/components/PageHead";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import { formatMemberDisplayName, getAvatarUrl, getInitialsFromName, inferInitialsFromEmail } from "~/utils/helpers";
import ActivityList from "./components/ActivityList";
import LabelSelector from "./components/LabelSelector";
import ListSelector from "./components/ListSelector";
import MemberSelector from "./components/MemberSelector";
import NewCommentForm from "./components/NewCommentForm";
import { Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import Comment from './components/Comment'
import { authClient } from "@kan/auth/client";

interface FormValues {
  cardId: string;
  title: string;
  description: string;
}

export function CardRightPanel() {
  const router = useRouter();
  const cardId = Array.isArray(router.query.cardId)
    ? router.query.cardId[0]
    : router.query.cardId;
  const utils = api.useUtils();
  const { showPopup } = usePopup();

  const { data: card } = api.card.byId.useQuery({
    cardPublicId: cardId ?? "",
  });

  const queryParams = {
    boardPublicId: card?.list.board.publicId ?? "",
  };
  const deleteCardMutation = api.card.delete.useMutation({
    onMutate: async (args) => {
      await utils.board.byId.cancel();

      const currentState = utils.board.byId.getData(queryParams);

      utils.board.byId.setData(queryParams, (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const updatedLists = oldBoard.lists.map((list) => {
          const updatedCards = list.cards.filter(
            (card) => card.publicId !== args.cardPublicId,
          );
          return { ...list, cards: updatedCards };
        });

        return { ...oldBoard, lists: updatedLists };
      });

      return { previousState: currentState };
    },
    onError: (_error, _newList, context) => {
      utils.board.byId.setData(queryParams, context?.previousState);
      showPopup({
        header: t`Unable to delete card`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSuccess: () => {
      router.push(`/boards/${card?.list.board.publicId}`);
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });

  const board = card?.list.board;
  const labels = board?.labels;
  const workspaceMembers = board?.workspace.members;
  const selectedLabels = card?.labels;
  const selectedMembers = card?.members;

  const formattedLabels =
    labels?.map((label) => {
      const isSelected = selectedLabels?.some(
        (selectedLabel) => selectedLabel.publicId === label.publicId,
      );

      return {
        key: label.publicId,
        value: label.name,
        selected: isSelected ?? false,
        leftIcon: <LabelIcon colourCode={label.colourCode} />,
      };
    }) ?? [];

  const formattedLists =
    board?.lists.map((list) => ({
      key: list.publicId,
      value: list.name,
      selected: list.publicId === card?.list.publicId,
    })) ?? [];

  const getInitials = (name: string, email: string) => {
    return name
      ? getInitialsFromName(name)
      : inferInitialsFromEmail(email);
  }

  const formattedMembers =
    workspaceMembers?.map((member) => {
      const isSelected = selectedMembers?.some(
        (assignedMember) => assignedMember.publicId === member.publicId,
      );

      return {
        key: member.publicId,
        value: formatMemberDisplayName(
          member.user?.name ?? null,
          member.user?.email ?? member.email,
        ),
        imageUrl: member.user?.image
          ? getAvatarUrl(member.user.image)
          : undefined,
        selected: isSelected ?? false,
        leftIcon: (
          <Avatar>
            <AvatarImage src={member.user?.image ? getAvatarUrl(member.user.image) : undefined} alt={member.user?.name ?? ""} />
            <AvatarFallback>{getInitials(member.user?.name ?? "", member.user?.email ?? member.email)}</AvatarFallback>
          </Avatar>
        ),
      };
    }) ?? [];

  return (
    <div className="flex flex-col gap-2 h-full w-[60em] bg-sidebar p-8">
      <div className="flex flex-col gap-2">
        <ListSelector
          cardPublicId={cardId ?? ""}
          lists={formattedLists}
          isLoading={!card}
        />
        <LabelSelector
          cardPublicId={cardId ?? ""}
          labels={formattedLabels}
          isLoading={!card}
        />
        <MemberSelector
          cardPublicId={cardId ?? ""}
          members={formattedMembers}
          isLoading={!card}
        />

        <div className="mt-4">
          <h2 className="text-md font-medium">
            {t`Activity`}
          </h2>
          <ActivityList
            activities={card?.activities ?? []}
          />
        </div>
      </div>

      <div className="justify-self-end mt-auto">
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="destructive">
              <Trash className="size-4" />
              {t`Delete`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t`Are you sure you want to delete this card?`}</AlertDialogTitle>
              <AlertDialogDescription>
                {t`This action can't be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteCardMutation.mutate({ cardPublicId: card?.publicId ?? "" })}>{t`Delete`}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function CardPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();
  const { data } = authClient.useSession();

  const cardId = Array.isArray(router.query.cardId)
    ? router.query.cardId[0]
    : router.query.cardId;

  const { data: card, isLoading } = api.card.byId.useQuery({
    cardPublicId: cardId ?? "",
  });

  const refetchCard = async () => {
    if (cardId) await utils.card.byId.refetch({ cardPublicId: cardId });
  };

  const board = card?.list.board;
  const activities = card?.activities;

  const updateCard = api.card.update.useMutation({
    onError: () => {
      showPopup({
        header: t`Unable to update card`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.card.byId.invalidate({ cardPublicId: cardId });
    },
  });

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    values: {
      cardId: cardId ?? "",
      title: card?.title ?? "",
      description: card?.description ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    updateCard.mutate({
      cardPublicId: values.cardId,
      title: values.title,
      description: values.description,
    });
  };

  if (!cardId) return <></>;

  return (
    <>
      <PageHead
        title={t`${card?.title ?? "Card"} | ${board?.name ?? "Board"}`}
      />
      <div className="flex h-full flex-1 flex-row">
        <div className="flex h-full w-full flex-col overflow-hidden">
          <div className="h-full max-h-[calc(100dvh-3rem)] overflow-y-auto p-6 md:max-h-[calc(100dvh-4rem)] md:p-8">
            <div className="mb-8 flex w-full items-center justify-between">
              {!card && isLoading && (
                <div className="flex space-x-2">
                  <div className="h-[2.3rem] w-[150px] animate-pulse rounded-[5px] bg-light-300 dark:bg-dark-300" />
                  <div className="h-[2.3rem] w-[300px] animate-pulse rounded-[5px] bg-light-300 dark:bg-dark-300" />
                </div>
              )}
              {card && (
                <>
                  <Link
                    className="whitespace-nowrap font-bold leading-[2.3rem] tracking-tight text-light-900 dark:text-dark-900 sm:text-[1.2rem]"
                    href={`/boards/${board?.publicId}`}
                  >
                    {board?.name}
                  </Link>
                  <IoChevronForwardSharp
                    size={18}
                    className="mx-2 text-light-900 dark:text-dark-900"
                  />
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full space-y-6"
                  >
                    <div>
                      <input
                        type="text"
                        id="title"
                        {...register("title")}
                        onBlur={handleSubmit(onSubmit)}
                        className="block w-full border-0 bg-transparent p-0 py-0 font-bold tracking-tight text-neutral-900 focus:ring-0 dark:text-dark-1000 sm:text-[1.2rem]"
                      />
                    </div>
                  </form>
                </>
              )}
              {!card && !isLoading && (
                <p className="block p-0 py-0 font-bold leading-[2.3rem] tracking-tight text-neutral-900 dark:text-dark-1000 sm:text-[1.2rem]">
                  {t`Card not found`}
                </p>
              )}
            </div>
            {card && (
              <>
                <div className="mb-10 flex w-full max-w-2xl flex-col justify-between">
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full space-y-6"
                  >
                    <div className="mt-2">
                      <Editor
                        content={card.description}
                        onChange={(e) => setValue("description", e)}
                        onBlur={() => handleSubmit(onSubmit)()}
                      />
                    </div>
                  </form>
                </div>
                <div className="border-t-[1px] border-light-600 pt-12 dark:border-dark-400">
                  <h2 className="text-md pb-4 font-medium text-light-900 dark:text-dark-1000">
                    {t`Comments`}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {activities?.map((activity, index) => {
                      if (activity.type === "card.updated.comment.added") {
                        return (
                          <Comment
                            key={index}
                            publicId={activity.comment?.publicId}
                            cardPublicId={card.publicId}
                            user={activity.user!}
                            createdAt={activity.createdAt.toISOString()}
                            comment={activity.comment?.comment}
                            isEdited={!!activity.comment?.updatedAt
                            }
                            isAuthor={activity.comment?.createdBy === data?.user.id}
                            isAdmin={workspace.role === "admin"}
                          />
                        );
                      }
                    })}
                  </div>
                  <div className="mt-6">
                    <NewCommentForm cardPublicId={cardId} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* <Modal>
          {modalContentType === "NEW_LABEL" && (
            <LabelForm boardPublicId={boardId ?? ""} refetch={refetchCard} />
          )}
          {modalContentType === "EDIT_LABEL" && (
            <LabelForm
              boardPublicId={boardId ?? ""}
              refetch={refetchCard}
              isEdit
            />
          )}
          {modalContentType === "DELETE_LABEL" && (
            <DeleteLabelConfirmation
              refetch={refetchCard}
              labelPublicId={entityId}
            />
          )}
          {modalContentType === "DELETE_COMMENT" && (
            <DeleteCommentConfirmation
              cardPublicId={cardId}
              commentPublicId={entityId}
            />
          )}
          {modalContentType === "NEW_WORKSPACE" && <NewWorkspaceForm />}
        </Modal> */}
      </div>
    </>
  );
}
