import { useEffect } from "react";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";

import { HiXMark } from "react-icons/hi2";
import { Switch } from "@headlessui/react";

import { useBoard } from "~/providers/board";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";

import { type NewListInput } from "~/types/router.types";

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

type NewListFormInput = NewListInput & {
  isCreateAnotherEnabled: boolean;
};

export function NewListForm({ boardPublicId }: { boardPublicId: string }) {
  const { refetchBoard, addList } = useBoard();
  const { closeModal } = useModal();
  const { showPopup } = usePopup();

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<NewListFormInput>({
      defaultValues: {
        name: "",
        boardPublicId: boardPublicId,
        isCreateAnotherEnabled: false,
      },
    });

  const isCreateAnotherEnabled = watch("isCreateAnotherEnabled");

  const createList = api.list.create.useMutation({
    onSuccess: async () => {
      await refetchBoard();
    },
    onError: async () => {
      closeModal();
      await refetchBoard();
      showPopup({
        header: "Unable to create list",
        message: "Please try again later, or contact customer support.",
      });
    },
  });

  useEffect(() => {
    const nameElement: HTMLElement | null =
      document?.querySelector<HTMLElement>("#list-name");
    if (nameElement) nameElement.focus();
  }, []);

  const onSubmit = (data: NewListInput) => {
    addList(data);
    const isCreateAnotherEnabled = watch("isCreateAnotherEnabled");
    if (!isCreateAnotherEnabled) closeModal();
    reset({
      name: "",
      isCreateAnotherEnabled,
    });

    createList.mutate({
      name: data.name,
      boardPublicId,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="px-5 pt-5">
        <div className="flex w-full items-center justify-between pb-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-dark-1000">
            New list
          </h2>
          <button
            className="rounded p-1 hover:bg-light-200 focus:outline-none dark:hover:bg-dark-300"
            onClick={(e) => {
              e.preventDefault();
              closeModal();
            }}
          >
            <HiXMark size={18} className="text-light-900 dark:text-dark-900" />
          </button>
        </div>

        <input
          id="list-name"
          placeholder="List name"
          {...register("name", { required: true })}
          className="block w-full rounded-md border-0 bg-dark-300 bg-white/5 py-1.5 text-neutral-900 placeholder-dark-800 shadow-sm ring-1 ring-inset ring-light-600 focus:ring-2 focus:ring-inset focus:ring-light-600 dark:text-dark-1000 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6"
        />
      </div>
      <div className="mt-12 flex items-center justify-end border-t border-light-600 px-5 pb-5 pt-5 dark:border-dark-600">
        <div className="mr-4 flex items-center justify-end">
          <span className="mr-2 text-xs text-light-900 dark:text-dark-900">
            Create more
          </span>
          <Switch
            checked={isCreateAnotherEnabled}
            onChange={() =>
              setValue("isCreateAnotherEnabled", !isCreateAnotherEnabled)
            }
            className={classNames(
              isCreateAnotherEnabled
                ? "bg-indigo-600"
                : "bg-light-800 dark:bg-dark-800",
              "relative inline-flex h-4 w-6 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            )}
          >
            <span className="sr-only">Create another</span>
            <span
              aria-hidden="true"
              className={classNames(
                isCreateAnotherEnabled ? "translate-x-2" : "translate-x-0",
                "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              )}
            />
          </Switch>
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md bg-light-1000 px-3 py-2 text-sm font-semibold text-light-50 shadow-sm focus-visible:outline-none dark:bg-dark-1000 dark:text-dark-50"
          >
            Create list
          </button>
        </div>
      </div>
    </form>
  );
}
