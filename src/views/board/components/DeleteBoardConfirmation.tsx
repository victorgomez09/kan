import { useRouter } from "next/navigation";

import { api } from "~/utils/api";
import { useBoard } from "~/providers/board";
import { useModal } from "~/providers/modal";

import Button from "~/components/Button";

export function DeleteBoardConfirmation() {
  const router = useRouter();
  const { boardData } = useBoard();
  const { closeModal } = useModal();

  const deleteBoard = api.board.delete.useMutation({
    onSuccess: () => {
      closeModal();
      router.push(`/boards`);
    },
  });

  const handleDeleteBoard = () => {
    if (boardData?.publicId)
      deleteBoard.mutate({
        boardPublicId: boardData.publicId,
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
        <Button onClick={handleDeleteBoard}>Delete</Button>
      </div>
    </div>
  );
}
