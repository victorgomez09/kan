import { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

import Button from "~/components/Button";
import { useBoard } from "~/providers/board";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

const VisibilityButton = ({
  visibility,
  boardPublicId,
}: {
  visibility: "public" | "private";
  boardPublicId: string;
}) => {
  const { refetchBoard } = useBoard();
  const { showPopup } = usePopup();
  const [stateVisibility, setStateVisibility] = useState<"public" | "private">(
    visibility,
  );

  useEffect(() => {
    setStateVisibility(visibility);
  }, [visibility]);

  const isPublic = stateVisibility === "public";

  const updateBoardVisibility = api.board.update.useMutation({
    onSuccess: async () => {
      await refetchBoard();
      setStateVisibility(isPublic ? "private" : "public");
    },
    onError: () => {
      showPopup({
        header: "Unable to update board visibility",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const handleUpdateBoardVisibility = () => {
    updateBoardVisibility.mutate({
      visibility: isPublic ? "private" : "public",
      boardPublicId,
    });
  };

  return (
    <Button
      variant="secondary"
      onClick={handleUpdateBoardVisibility}
      iconLeft={isPublic ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
      isLoading={updateBoardVisibility.isPending}
    >
      {isPublic ? "Public" : "Private"}
    </Button>
  );
};

export default VisibilityButton;
