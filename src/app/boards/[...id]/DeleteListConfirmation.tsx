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
        <h2 className="text-md pb-4 font-medium text-dark-1000">
          Are you sure you want to delete this list?
        </h2>
        <p className="text-sm font-medium text-dark-900">
          {"This action can't be undone."}
        </p>
      </div>
      <div className="mt-5 flex justify-end sm:mt-6">
        <button
          className="mr-4 inline-flex justify-center rounded-md border-[1px] border-dark-600 bg-dark-300 px-3 py-2 text-sm font-semibold text-dark-1000 shadow-sm focus-visible:outline-none"
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
          className="inline-flex justify-center rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 shadow-sm focus-visible:outline-none"
        >
          Delete
        </button>
      </div>
    </>
  );
}
