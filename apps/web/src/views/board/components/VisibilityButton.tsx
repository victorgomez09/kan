import { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

import Button from "~/components/Button";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface QueryParams {
  boardPublicId: string;
  members: string[];
  labels: string[];
}

const VisibilityButton = ({
  visibility,
  boardPublicId,
  queryParams,
  isLoading,
}: {
  visibility: "public" | "private";
  boardPublicId: string;
  queryParams: QueryParams;
  isLoading: boolean;
}) => {
  const { showPopup } = usePopup();
  const utils = api.useUtils();
  const [stateVisibility, setStateVisibility] = useState<"public" | "private">(
    visibility,
  );

  useEffect(() => {
    setStateVisibility(visibility);
  }, [visibility]);

  const isPublic = stateVisibility === "public";

  const updateBoardVisibility = api.board.update.useMutation({
    onSuccess: () => {
      setStateVisibility(isPublic ? "private" : "public");
    },
    onError: () => {
      showPopup({
        header: "Unable to update board visibility",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
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
      disabled={isLoading}
    >
      {isPublic ? "Public" : "Private"}
    </Button>
  );
};

export default VisibilityButton;
