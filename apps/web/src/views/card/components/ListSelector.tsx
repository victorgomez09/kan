import { Menu } from "@headlessui/react";

import CheckboxDropdown from "~/components/CheckboxDropdown";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface ListSelectorProps {
  cardPublicId: string;
  lists: {
    key: string;
    value: string;
    selected: boolean;
  }[];
  refetchCard: () => Promise<void>;
  handleChangeList: (newListPublicId: string, newListName: string) => void;
  isLoading: boolean;
}

export default function ListSelector({
  cardPublicId,
  lists,
  handleChangeList,
  refetchCard,
  isLoading,
}: ListSelectorProps) {
  const { showPopup } = usePopup();

  const updateCardList = api.card.reorder.useMutation({
    onSuccess: async () => {
      await refetchCard();
    },
    onError: async () => {
      await refetchCard();
      showPopup({
        header: "Unable to update list",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const selectedList = lists.find((list) => list.selected);

  return (
    <>
      {isLoading ? (
        <div className="flex w-full">
          <div className="h-full w-[150px] animate-pulse rounded-[5px] bg-light-300 dark:bg-dark-300" />
        </div>
      ) : (
        <CheckboxDropdown
          items={lists}
          handleSelect={(_, member) => {
            handleChangeList(member.key, member.value);
            updateCardList.mutate({
              cardPublicId,
              newListPublicId: member.key,
            });
          }}
          asChild
        >
          <Menu.Button className="flex h-full w-full items-center rounded-[5px] border-[1px] border-light-200 py-1 pl-2 text-left text-sm text-neutral-900 hover:border-light-300 hover:bg-light-300 dark:border-dark-100 dark:text-dark-1000 dark:hover:border-dark-300 dark:hover:bg-dark-200">
            {selectedList?.value}
          </Menu.Button>
        </CheckboxDropdown>
      )}
    </>
  );
}
