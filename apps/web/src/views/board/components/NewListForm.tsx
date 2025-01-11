import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { HiXMark } from "react-icons/hi2";

import type { NewListInput } from "@kan/api/types";

import Button from "~/components/Button";
import Input from "~/components/Input";
import Toggle from "~/components/Toggle";
import { useBoard } from "~/providers/board";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

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
        icon: "error",
      });
    },
  });

  useEffect(() => {
    const nameElement: HTMLElement | null =
      document.querySelector<HTMLElement>("#list-name");
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

        <Input id="list-name" placeholder="List name" {...register("name")} />
      </div>
      <div className="mt-12 flex items-center justify-end border-t border-light-600 px-5 pb-5 pt-5 dark:border-dark-600">
        <Toggle
          label="Create another"
          isChecked={isCreateAnotherEnabled}
          onChange={() =>
            setValue("isCreateAnotherEnabled", !isCreateAnotherEnabled)
          }
        />

        <div>
          <Button type="submit">Create list</Button>
        </div>
      </div>
    </form>
  );
}
