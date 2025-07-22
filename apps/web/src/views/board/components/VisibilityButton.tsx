import { t } from "@lingui/core/macro";
import { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

import Button from "~/components/Button";
import CheckboxDropdown from "~/components/CheckboxDropdown";
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
    <div className="relative">
      <CheckboxDropdown
        items={[
          {
            key: "public",
            value: t`Public`,
            selected: isPublic,
          },
          {
            key: "private",
            value: t`Private`,
            selected: !isPublic,
          },
        ]}
        handleSelect={(_g, i) => {
          setStateVisibility(isPublic ? "private" : "public");
          updateBoardVisibility.mutate({
            visibility: i.key as "public" | "private",
            boardPublicId,
          });
        }}
        menuSpacing="md"
      >
        <Button
          variant="secondary"
          iconLeft={isPublic ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
          disabled={isLoading || !isAdmin}
        >
          {t`Visibility`}
        </Button>
      </CheckboxDropdown>
    </div>
  );
};

export default VisibilityButton;
