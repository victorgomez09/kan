import { Button } from "~/components/ui/button";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface DeleteListConfirmationProps {
  listPublicId: string;
  queryParams: QueryParams;
}

interface QueryParams {
  boardPublicId: string;
  members: string[];
  labels: string[];
}

export function DeleteListConfirmation({
  listPublicId,
  queryParams,
}: DeleteListConfirmationProps) {
  const utils = api.useUtils();
  const { showPopup } = usePopup();

  const deleteList = api.list.delete.useMutation({
    onError: () => {
      showPopup({
        header: "Unable to delete list",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });

  return (
    <div className="p-5">
      <div className="mt-5 flex justify-end space-x-2 sm:mt-6">
        <Button variant="secondary">
          Cancel
        </Button>
        <Button
          isLoading={deleteList.isPending}
          onClick={() => deleteList.mutate({ listPublicId })}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
