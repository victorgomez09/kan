import { t } from "@lingui/core/macro";
import { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { Button } from "~/components/ui/button";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

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
  isAdmin,
}: {
  visibility: "public" | "private";
  boardPublicId: string;
  boardSlug: string;
  queryParams: QueryParams;
  isLoading: boolean;
  isAdmin: boolean;
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
      showPopup({
        header: t`Board visibility updated`,
        message: t`The visibility of your board has been set to ${isPublic ? "public" : "private"}.`,
        icon: "success",
      });
    },
    onError: () => {
      showPopup({
        header: t`Unable to update board visibility`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="secondary"
          disabled={isLoading || !isAdmin}
          className="flex items-center gap-2"
        >
          {isPublic ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
          {t`Visibility`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="flex items-center gap-2">
          <Checkbox
            id="public"
            onClick={() => {
              setStateVisibility(isPublic ? "private" : "public");
              updateBoardVisibility.mutate({
                visibility: "public",
                boardPublicId,
              });
            }}
            checked={isPublic} />
          <Label
            htmlFor="public"
          >
            {t`Public`}
          </Label>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2">
          <Checkbox
            id="private"
            onClick={() => {
              setStateVisibility(isPublic ? "private" : "public");
              updateBoardVisibility.mutate({
                visibility: "private",
                boardPublicId,
              });
            }}
            checked={!isPublic} />
          <Label
            htmlFor="private"
          >
            {t`Public`}
          </Label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VisibilityButton;
