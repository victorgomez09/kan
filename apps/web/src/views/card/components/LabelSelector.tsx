import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { HiEllipsisHorizontal, HiMiniPlus } from "react-icons/hi2";

import Badge from "~/components/Badge";
import LabelIcon from "~/components/LabelIcon";
import { useModal } from "~/providers/modal";
import { api } from "~/utils/api";

interface LabelSelectorProps {
  cardPublicId: string;
  labels: {
    publicId: string;
    name: string;
    selected: boolean;
    colourCode: string;
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

  const { register, handleSubmit, setValue, watch } = useForm({
    values: Object.fromEntries(
      labels.map((label) => [label.publicId, label.selected]) ?? [],
    ),
  });

  const onSubmit = (values: Record<string, boolean>) => {
    console.log({ values });
  };

  const selectedLabels = labels.filter((label) => label.selected);

  return (
    <>
      {isLoading ? (
        <div className="flex w-full">
          <div className="h-full w-[175px] animate-pulse rounded-[5px] bg-light-300 dark:bg-dark-300" />
        </div>
      ) : (
        <Menu
          as="div"
          className="relative flex w-full flex-wrap items-center text-left"
        >
          {selectedLabels.length ? (
            <div className="flex flex-wrap gap-x-0.5">
              {selectedLabels.map((label) => (
                <Menu.Button key={label.publicId}>
                  <Badge
                    value={label.name}
                    iconLeft={<LabelIcon colourCode={label.colourCode} />}
                  />
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

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-[200px] top-[30px] z-10 mt-2 w-56 origin-top-right rounded-md border-[1px] border-light-600 bg-light-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200">
              <div className="p-2">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {labels.map((label) => (
                    <Menu.Item key={label.publicId}>
                      {() => (
                        <div
                          key={label.publicId}
                          className="group flex items-center rounded-[5px] p-2 hover:bg-light-200 dark:hover:bg-dark-300"
                          onClick={() => {
                            const newValue = !watch(label.publicId);
                            setValue(label.publicId, newValue);

                            addOrRemoveLabel.mutate({
                              cardPublicId,
                              labelPublicId: label.publicId,
                            });

                            handleSubmit(onSubmit);
                          }}
                        >
                          <input
                            id={label.publicId}
                            type="checkbox"
                            className="h-[14px] w-[14px] rounded bg-transparent"
                            onClick={(event) => event.stopPropagation()}
                            {...register(label.publicId)}
                            checked={watch(label.publicId)}
                          />
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center">
                              <span className="ml-3 flex items-center">
                                <LabelIcon colourCode={label.colourCode} />
                              </span>
                              <label
                                htmlFor={label.publicId}
                                className="ml-3 text-sm"
                              >
                                {label.name}
                              </label>
                            </div>

                            <button
                              className="invisible group-hover:visible"
                              onClick={(event) => {
                                event.stopPropagation();
                                openModal("EDIT_LABEL", label.publicId);
                              }}
                            >
                              <HiEllipsisHorizontal size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                  <button
                    onClick={() => openModal("NEW_LABEL")}
                    className="flex w-full items-center rounded-[5px] p-1.5 px-2 text-sm hover:bg-light-200 dark:hover:bg-dark-300"
                  >
                    <HiMiniPlus size={22} className="pr-2" />
                    Create new label
                  </button>
                </form>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </>
  );
}
