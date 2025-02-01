import { Menu } from "@headlessui/react";
import { HiMiniPlus } from "react-icons/hi2";

import Badge from "~/components/Badge";
import CheckboxDropdown from "~/components/CheckboxDropdown";
import { useModal } from "~/providers/modal";
import { api } from "~/utils/api";

interface LabelSelectorProps {
  cardPublicId: string;
  labels: {
    key: string;
    value: string;
    selected: boolean;
    leftIcon: React.ReactNode;
  }[];
  isLoading: boolean;
}

export default function LabelSelector({
  cardPublicId,
  labels,
  isLoading,
}: LabelSelectorProps) {
  const { openModal } = useModal();
  const utils = api.useUtils();

  const refetchCard = () => utils.card.byId.refetch({ cardPublicId });

  const addOrRemoveLabel = api.card.addOrRemoveLabel.useMutation({
    onSuccess: async () => {
      await refetchCard();
    },
  });

  const selectedLabels = labels.filter((label) => label.selected);

  return (
    <>
      {isLoading ? (
        <div className="flex w-full">
          <div className="h-full w-[175px] animate-pulse rounded-[5px] bg-light-300 dark:bg-dark-300" />
        </div>
      ) : (
        <CheckboxDropdown
          items={labels}
          handleSelect={(_, label) =>
            addOrRemoveLabel.mutate({ cardPublicId, labelPublicId: label.key })
          }
          handleEdit={(labelPublicId) => openModal("EDIT_LABEL", labelPublicId)}
          handleCreate={() => openModal("NEW_LABEL")}
          createNewItemLabel="Create new label"
          asChild
        >
          {selectedLabels.length ? (
            <div className="flex flex-wrap gap-x-0.5">
              {selectedLabels.map((label) => (
                <Menu.Button key={label.key}>
                  <Badge value={label.value} iconLeft={label.leftIcon} />
                </Menu.Button>
              ))}
              <Menu.Button>
                <Badge value="Add label" iconLeft={<HiMiniPlus size={14} />} />
              </Menu.Button>
            </div>
          ) : (
            <Menu.Button className="flex h-full w-full items-center rounded-[5px] border-[1px] border-light-200 pl-2 text-left text-sm text-neutral-900 hover:bg-light-300 dark:border-dark-100 dark:text-dark-1000 dark:hover:border-dark-300 dark:hover:bg-dark-200">
              <HiMiniPlus size={22} className="pr-2" />
              Add label
            </Menu.Button>
          )}
        </CheckboxDropdown>
      )}
    </>
  );
}
