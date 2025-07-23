import { Menu } from "@headlessui/react";
import { t } from "@lingui/core/macro";
import CheckboxDropdown from "~/components/CheckboxDropdown";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

interface ListSelectorProps {
  cardPublicId: string;
  lists: {
    key: string;
    value: string;
    selected: boolean;
  }[];
  isLoading: boolean;
}

export default function ListSelector({
  cardPublicId,
  lists,
  isLoading,
}: ListSelectorProps) {
  const utils = api.useUtils();

  const { showPopup } = usePopup();

  const updateCardList = api.card.update.useMutation({
    onMutate: async (newList) => {
      await utils.card.byId.cancel();

      const previousCard = utils.card.byId.getData({ cardPublicId });

      utils.card.byId.setData({ cardPublicId }, (oldCard) => {
        if (!oldCard) return oldCard;

        return {
          ...oldCard,
          list: {
            ...oldCard.list,
            publicId: newList.listPublicId ?? "",
            name: oldCard.list.name ?? "",
            board: oldCard.list.board ?? null,
          },
        };
      });

      return { previousCard };
    },
    onError: (_error, _newList, context) => {
      utils.card.byId.setData({ cardPublicId }, context?.previousCard);
      showPopup({
        header: t`Unable to update list`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.card.byId.invalidate({ cardPublicId });
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
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="flex h-full w-full items-center" variant="secondary">
              {t`List`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {lists?.map((item, key) => {
              return (
                <DropdownMenuItem key={key}>
                  <div
                    className="group flex items-center justify-between gap-2 w-full"
                  >
                    <Checkbox
                      id={item.key}
                      name={item.key}
                      onClick={() => {
                        updateCardList.mutate({
                          cardPublicId,
                          listPublicId: item.key,
                          index: 0,
                        });
                      }}
                      checked={selectedList?.key === item.key} />
                    <label
                      htmlFor={item.key}
                      className="ml-3"
                    >
                      {item.value}
                    </label>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
