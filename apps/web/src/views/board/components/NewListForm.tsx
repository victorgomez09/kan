import type { NewListInput } from "@kan/api/types";
import { generateUID } from "@kan/shared/utils";
import { t } from "@lingui/core/macro";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Toggle from "~/components/Toggle";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

type NewListFormInput = NewListInput & {
  isCreateAnotherEnabled: boolean;
};

interface QueryParams {
  boardPublicId: string;
  members: string[];
  labels: string[];
}

export function NewListForm({
  boardPublicId,
  queryParams,
}: {
  boardPublicId: string;
  queryParams: QueryParams;
}) {
  const { showPopup } = usePopup();

  const utils = api.useUtils();

  const form =
    useForm<NewListFormInput>({
      defaultValues: {
        name: "",
        boardPublicId: boardPublicId,
        isCreateAnotherEnabled: false,
      },
    });

  const isCreateAnotherEnabled = form.watch("isCreateAnotherEnabled");

  const createList = api.list.create.useMutation({
    onMutate: async (args) => {
      await utils.board.byId.cancel();

      const currentState = utils.board.byId.getData(queryParams);

      utils.board.byId.setData(queryParams, (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const newList = {
          publicId: generateUID(),
          name: args.name,
          boardId: 1,
          boardPublicId,
          cards: [],
          index: oldBoard.lists.length,
        };

        const updatedLists = [...oldBoard.lists, newList];

        return { ...oldBoard, lists: updatedLists };
      });

      return { previousState: currentState };
    },
    onError: (_error, _newList, context) => {
      utils.board.byId.setData(queryParams, context?.previousState);
      showPopup({
        header: t`Unable to create list`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSettled: async () => {
      await utils.board.byId.invalidate(queryParams);
    },
  });

  useEffect(() => {
    const nameElement: HTMLElement | null =
      document.querySelector<HTMLElement>("#list-name");
    if (nameElement) nameElement.focus();
  }, []);

  const onSubmit = (data: NewListInput) => {
    const isCreateAnotherEnabled = form.watch("isCreateAnotherEnabled");
    form.reset({
      name: "",
      isCreateAnotherEnabled,
    });

    createList.mutate({
      name: data.name,
      boardPublicId,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        id="login-form"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t`Enter your email adress`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-12 flex items-center justify-end gap-2 border-t border-light-600 px-5 pb-5 pt-5">
          {/* <Toggle
            label={t`Create another`}
            isChecked={isCreateAnotherEnabled}
            onChange={() =>
              form.setValue("isCreateAnotherEnabled", !isCreateAnotherEnabled)
            }
          /> */}
          <div className="flex items-center gap-2 me-4">
            <Label htmlFor="create-other">{t`Create another`}</Label>
            <Switch
              id="create-other"
              checked={isCreateAnotherEnabled}
              onCheckedChange={() => form.setValue("isCreateAnotherEnabled", !isCreateAnotherEnabled)}
              aria-readonly
            />
          </div>

          <Button type="submit">{t`Create card`}</Button>
        </div>
      </form>
    </Form>
    // <form onSubmit={handleSubmit(onSubmit)}>
    //   <div className="px-5 pt-5">
    //     <div className="flex w-full items-center justify-between pb-4">
    //       <button
    //         type="button"
    //         className="rounded p-1 hover:bg-light-200 focus:outline-none dark:hover:bg-dark-300"
    //         onClick={(e) => {
    //           e.preventDefault();
    //         }}
    //       >
    //         <HiXMark size={18} className="text-light-900 dark:text-dark-900" />
    //       </button>
    //     </div>

    //     <Input
    //       id="list-name"
    //       placeholder={t`List name`}
    //       {...register("name")}
    //       onKeyDown={async (e) => {
    //         if (e.key === "Enter") {
    //           e.preventDefault();
    //           await handleSubmit(onSubmit)();
    //         }
    //       }}
    //     />
    //   </div>
    //   <div className="mt-12 flex items-center justify-end border-t border-light-600 px-5 pb-5 pt-5 dark:border-dark-600">
    //     <Toggle
    //       label={t`Create another`}
    //       isChecked={isCreateAnotherEnabled}
    //       onChange={() => 
    //         setValue("isCreateAnotherEnabled", !isCreateAnotherEnabled)
    //       }
    //     />

    //     <div>
    //       <Button type="submit">{t`Create list`}</Button>
    //     </div>
    //   </div>
    // </form>
  );
}
