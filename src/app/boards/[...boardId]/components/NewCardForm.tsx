"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";

import { HiXMark } from "react-icons/hi2";
import { Switch } from "@headlessui/react";

import CheckboxDropdown from "~/app/components/CheckboxDropdown";
import { useBoard } from "~/app/providers/board";
import { useModal } from "~/app/providers/modal";

interface FormData {
  title: string;
  listPublicId: string;
  memberPublicIds: string[];
}

interface NewCardFormProps {
  listPublicId: string;
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export function NewCardForm({ listPublicId }: NewCardFormProps) {
  const utils = api.useUtils();
  const { boardData } = useBoard();
  const { closeModal } = useModal();
  const [isCreateAnotherEnabled, setIsCreateAnotherEnabled] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: "",
      listPublicId,
      memberPublicIds: [],
    },
  });

  const memberPublicIds = watch("memberPublicIds") || [];

  const refetchBoard = () =>
    utils.board.byId.refetch({ id: boardData.publicId });

  const createCard = api.card.create.useMutation({
    onSuccess: async () => {
      try {
        await refetchBoard();
        if (!isCreateAnotherEnabled) closeModal();
      } catch (e) {
        console.log(e);
      }
    },
  });

  useEffect(() => {
    const titleElement: HTMLElement | null =
      document?.querySelector<HTMLElement>("#title");
    if (titleElement) titleElement.focus();
  }, []);

  const formattedLists =
    boardData?.lists.map((list) => ({
      key: list.publicId,
      value: list.name,
      selected: list.publicId === watch("listPublicId"),
    })) ?? [];

  const formattedMembers =
    boardData?.workspace?.members?.map((member) => ({
      key: member.publicId,
      value: member.user.name,
      selected: memberPublicIds.includes(member.publicId),
    })) ?? [];

  const onSubmit = (data: FormData) => {
    createCard.mutate({
      title: data.title,
      listPublicId: data.listPublicId,
      memberPublicIds: data.memberPublicIds,
    });
    reset();
  };

  const handleSelectList = (listPublicId: string): void => {
    setValue("listPublicId", listPublicId);
  };

  const handleSelectMembers = (memberPublicId: string): void => {
    const currentIndex = memberPublicIds.indexOf(memberPublicId);
    if (currentIndex === -1) {
      setValue("memberPublicIds", [...memberPublicIds, memberPublicId]);
    } else {
      const newMemberPublicIds = [...memberPublicIds];
      newMemberPublicIds.splice(currentIndex, 1);
      setValue("memberPublicIds", newMemberPublicIds);
    }
  };

  const selectedList = formattedLists.find((item) => item.selected);

  return (
    <>
      <div className="flex w-full justify-between pb-4">
        <h2 className="text-sm font-bold text-dark-1000">New card</h2>
        <button
          className="rounded p-1 hover:bg-dark-300 focus:outline-none"
          onClick={() => closeModal()}
        >
          <HiXMark size={18} className="text-dark-900" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="title"
            className="block pb-2 text-sm font-normal leading-6 text-dark-1000"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="block w-full rounded-md border-0 bg-dark-300 bg-white/5 py-1.5 text-dark-1000 shadow-sm ring-1 ring-inset ring-dark-700 focus:ring-2 focus:ring-inset focus:ring-dark-700 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mt-2 flex space-x-1">
          <div className="w-fit">
            <CheckboxDropdown
              items={formattedLists}
              handleSelect={(list: { key: string }) =>
                handleSelectList(list.key)
              }
            >
              <div className="flex h-full w-full items-center rounded-[5px] border-[1px] border-dark-600 bg-dark-400 px-2 py-1 text-left text-xs text-dark-1000 hover:bg-dark-500">
                {selectedList?.value}
              </div>
            </CheckboxDropdown>
          </div>
          <div className="w-fit">
            <CheckboxDropdown
              items={formattedMembers}
              handleSelect={(list: { key: string }) =>
                handleSelectMembers(list.key)
              }
            >
              <div className="flex h-full w-full items-center rounded-[5px] border-[1px] border-dark-600 bg-dark-400 px-2 py-1 text-left text-xs text-dark-1000 hover:bg-dark-500">
                {!memberPublicIds.length ? (
                  "Members"
                ) : (
                  <>
                    {memberPublicIds.map((memberPublicId) => {
                      const member = formattedMembers.find(
                        (member) => member.key === memberPublicId,
                      );

                      return (
                        <span
                          key={member?.key}
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 ring-1 ring-dark-500"
                        >
                          <span className="text-[8px] font-medium leading-none text-white">
                            {member?.value
                              .split(" ")
                              .map((namePart) =>
                                namePart.charAt(0).toUpperCase(),
                              )
                              .join("")}
                          </span>
                        </span>
                      );
                    })}
                  </>
                )}
              </div>
            </CheckboxDropdown>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end">
          <span className="mr-2 text-xs text-dark-900">Create more</span>
          <Switch
            checked={isCreateAnotherEnabled}
            onChange={setIsCreateAnotherEnabled}
            className={classNames(
              isCreateAnotherEnabled ? "bg-indigo-600" : "bg-dark-800",
              "relative inline-flex h-4 w-6 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            )}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={classNames(
                isCreateAnotherEnabled ? "translate-x-2" : "translate-x-0",
                "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              )}
            />
          </Switch>
        </div>

        <div className="mt-5 sm:mt-6">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 shadow-sm focus-visible:outline-none"
          >
            Create card
          </button>
        </div>
      </form>
    </>
  );
}
