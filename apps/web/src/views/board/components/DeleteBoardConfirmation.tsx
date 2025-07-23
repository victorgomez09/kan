import { useRouter } from "next/navigation";

import {Button} from "~/components/ui/button";
import { useModal } from "~/providers/modal";
import { api } from "~/utils/api";

export function DeleteBoardConfirmation({
  boardPublicId,
}: {
  boardPublicId: string;
}) {
  const router = useRouter();
  const { closeModal } = useModal();

  const deleteBoard = api.board.delete.useMutation({
    onSuccess: () => {
      router.push(`/boards`);
    },
  });

  const handleDeleteBoard = () => {
    if (boardPublicId)
      deleteBoard.mutate({
        boardPublicId: boardPublicId,
      });
  };

  return (
    <div className="p-5">
      <div className="flex w-full flex-col justify-between pb-4">
        <h2 className="text-md pb-4 font-medium text-neutral-900 dark:text-dark-1000">
          Are you sure you want to delete this board?
        </h2>
        <p className="text-sm font-medium text-light-900 dark:text-dark-900">
          {"This action can't be undone."}
        </p>
      </div>
      <div className="mt-5 flex justify-end space-x-2 sm:mt-6">
        <Button onClick={() => closeModal()} variant="secondary">
          Cancel
        </Button>
        <Button onClick={handleDeleteBoard} isLoading={deleteBoard.isPending}>
          Delete
        </Button>
      </div>
    </div>
  );
}
