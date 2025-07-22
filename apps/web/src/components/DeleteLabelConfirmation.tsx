import { Button } from "~/components/ui/button";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { t } from "@lingui/core/macro";

export function DeleteLabelConfirmation({
  labelPublicId,
  refetch,
}: {
  labelPublicId: string;
  refetch: () => void;
}) {
  const { closeModal } = useModal();
  const { showPopup } = usePopup();

  const deleteLabelMutation = api.label.delete.useMutation({
    onSuccess: () => refetch(),
    onError: () =>
      showPopup({
        header: "Error deleting label",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      }),
  });

  const handleDeleteLabel = () => {
    deleteLabelMutation.mutate({
      labelPublicId,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger onClick={(event) => {
        event.stopPropagation();
      }}>
        <Button
          variant="secondary"
        >
          {t`Delete`}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={e => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this label?</AlertDialogTitle>
          <AlertDialogDescription>This action can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => handleDeleteLabel()}>Delete</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
