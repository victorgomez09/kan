"use client";

import { api } from "~/trpc/react";
import { useBoard } from "~/app/providers/board";
import { useModal } from "~/app/providers/modal";

interface DeleteListConfirmationProps {
  listPublicId: string;
}

export function DeleteListConfirmation({
  listPublicId,
}: DeleteListConfirmationProps) {
  const utils = api.useUtils();
  const { boardData } = useBoard();
  const { closeModal } = useModal();

  const refetchBoard = () =>
    utils.board.byId.refetch({ id: boardData.publicId });

  const deleteList = api.list.delete.useMutation({
    onSuccess: async () => {
      closeModal();
      await refetchBoard();
    },
  });

  return (
    <>
      <div className="flex w-full flex-col justify-between pb-4">
        <h2 className="text-md pb-4 font-medium text-neutral-900 dark:text-dark-1000">
          Are you sure you want to delete this list?
        </h2>
        <p className="text-light-900 text-sm font-medium dark:text-dark-900">
          {"This action can't be undone."}
        </p>
      </div>
      <div className="mt-5 flex justify-end sm:mt-6">
        <button
          className="bg-light-50 border-light-600 mr-4 inline-flex justify-center rounded-md border-[1px] px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm focus-visible:outline-none dark:border-dark-600 dark:bg-dark-300 dark:text-dark-1000"
          onClick={() => closeModal()}
        >
          Cancel
        </button>
        <button
          onClick={() =>
            deleteList.mutate({
              listPublicId,
            })
          }
          className="bg-light-1000 text-light-50 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none dark:bg-dark-1000 dark:text-dark-50"
        >
          Delete
        </button>
      </div>
    </>
  );
}
