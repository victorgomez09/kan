import { t } from "@lingui/core/macro";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { usePopup } from "~/providers/popup";
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
  const utils = api.useUtils();
  const { showPopup } = usePopup();

  const addOrRemoveLabel = api.card.addOrRemoveLabel.useMutation({
    onMutate: async (update) => {
      await utils.card.byId.cancel();

      const previousCard = utils.card.byId.getData({ cardPublicId });

      utils.card.byId.setData({ cardPublicId }, (oldCard) => {
        if (!oldCard) return oldCard;

        const hasLabel = oldCard.labels.some(
          (label) => label.publicId === update.labelPublicId,
        );

        const labelToAdd = oldCard.labels.find(
          (label) => label.publicId === update.labelPublicId,
        );

        const updatedLabels = hasLabel
          ? oldCard.labels.filter(
            (label) => label.publicId !== update.labelPublicId,
          )
          : [
            ...oldCard.labels,
            {
              publicId: update.labelPublicId,
              name: labelToAdd?.name ?? "",
              colourCode: labelToAdd?.colourCode ?? "",
            },
          ];

        return {
          ...oldCard,
          labels: updatedLabels,
        };
      });

      return { previousCard };
    },
    onError: (_error, _newList, context) => {
      utils.card.byId.setData({ cardPublicId }, context?.previousCard);
      showPopup({
        header: t`Unable to update labels`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.card.byId.invalidate({ cardPublicId });
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
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button className="flex h-full w-full items-center" variant="secondary">
              {t`Labels`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {labels?.map((item, key) => {
              return (
                <DropdownMenuItem key={key}>
                  <div
                    className="group flex items-center justify-between gap-2 w-full"
                  >
                    {/* <Menu.Button className="flex h-full w-full items-center rounded-[5px] border-[1px] border-light-200 pl-2 text-left text-sm text-neutral-900 hover:bg-light-300 dark:border-dark-100 dark:text-dark-1000 dark:hover:border-dark-300 dark:hover:bg-dark-200">
               <HiMiniPlus size={22} className="pr-2" />
               {t`Add label`}
             </Menu.Button>
           )} */}
                    <Checkbox
                      id={item.key}
                      name={item.key}
                      onClick={() => {
                        addOrRemoveLabel.mutate({ cardPublicId, labelPublicId: item.key })
                      }}
                      checked={selectedLabels[key]?.key === item.key} />
                    <Badge variant="secondary" className="flex items-center gap-2">
                      {item.leftIcon}
                      {item.value}
                    </Badge>
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
