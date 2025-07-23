import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { NewCardInput } from "@kan/api/types";
import { generateUID } from "@kan/shared/utils";
import { Pencil } from "lucide-react";
import { HiMiniPlus } from "react-icons/hi2";
import CheckboxDropdown from "~/components/CheckboxDropdown";
import { LabelForm } from "~/components/LabelForm";
import LabelIcon from "~/components/LabelIcon";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { formatMemberDisplayName } from "~/utils/helpers";

type NewCardFormInput = NewCardInput & {
  isCreateAnotherEnabled: boolean;
};

interface QueryParams {
  boardPublicId: string;
  members: string[];
  labels: string[];
}

interface NewCardFormProps {
  boardPublicId: string;
  listPublicId: string;
  queryParams: QueryParams;
}

export function NewCardForm({
  boardPublicId,
  listPublicId,
  queryParams,
}: NewCardFormProps) {
  const { showPopup } = usePopup();
  const { closeModal } = useModal();
  const utils = api.useUtils();

  const form =
    useForm<NewCardFormInput>({
      defaultValues: {
        title: "",
        description: "",
        listPublicId,
        labelPublicIds: [],
        memberPublicIds: [],
        isCreateAnotherEnabled: false,
        position: "start",
      },
    });

  const labelPublicIds = form.watch("labelPublicIds") || [];
  const memberPublicIds = form.watch("memberPublicIds") || [];
  const isCreateAnotherEnabled = form.watch("isCreateAnotherEnabled");
  const position = form.watch("position");
  const title = form.watch("title");

  const { data: boardData } = api.board.byId.useQuery(queryParams, {
    enabled: !!boardPublicId,
  });

  const createCard = api.card.create.useMutation({
    onMutate: async (args) => {
      await utils.board.byId.cancel();

      const currentState = utils.board.byId.getData(queryParams);

      utils.board.byId.setData(queryParams, (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const updatedLists = oldBoard.lists.map((list) => {
          if (list.publicId === listPublicId) {
            const newCard = {
              publicId: `PLACEHOLDER_${generateUID()}`,
              title: args.title,
              listId: 2,
              description: "",
              labels: oldBoard.labels.filter((label) =>
                args.labelPublicIds.includes(label.publicId),
              ),
              members:
                oldBoard.workspace.members
                  .filter((member) =>
                    args.memberPublicIds.includes(member.publicId),
                  )
                  .map((member) => ({
                    ...member,
                    deletedAt: null,
                  })) ?? [],
              _filteredLabels: labelPublicIds.map((id) => ({ publicId: id })),
              _filteredMembers: memberPublicIds.map((id) => ({ publicId: id })),
              index: position === "start" ? 0 : list.cards.length,
            };

            const updatedCards =
              position === "start"
                ? [newCard, ...list.cards]
                : [...list.cards, newCard];
            return { ...list, cards: updatedCards };
          }
          return list;
        });

        return { ...oldBoard, lists: updatedLists };
      });

      return { previousState: currentState };
    },
    onError: (error, _newList, context) => {
      utils.board.byId.setData(queryParams, context?.previousState);
      showPopup({
        header: t`Unable to create card`,
        message: error.data?.zodError?.fieldErrors.title?.[0]
          ? `${error.data.zodError.fieldErrors.title[0].replace("String", "Title")}`
          : t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
    onSuccess: async () => {
      const isCreateAnotherEnabled = form.watch("isCreateAnotherEnabled");
      if (!isCreateAnotherEnabled) closeModal();
      await utils.board.byId.invalidate(queryParams);
      form.reset({
        title: "",
        description: "",
        listPublicId: form.watch("listPublicId"),
        labelPublicIds: [],
        memberPublicIds: [],
        isCreateAnotherEnabled,
        position,
      });
    },
  });

  useEffect(() => {
    const titleElement: HTMLElement | null =
      document.querySelector<HTMLElement>("#title");
    if (titleElement) titleElement.focus();
  }, []);

  const formattedLabels =
    boardData?.labels.map((label) => ({
      key: label.publicId,
      value: label.name,
      leftIcon: <LabelIcon colourCode={label.colourCode} />,
      selected: labelPublicIds.includes(label.publicId),
      publicId: label.publicId
    })) ?? [];

  const formattedLists =
    boardData?.lists.map((list) => ({
      key: list.publicId,
      value: list.name,
      selected: list.publicId === form.watch("listPublicId"),
    })) ?? [];

  const formattedMembers =
    boardData?.workspace.members.map((member) => ({
      key: member.publicId,
      value: formatMemberDisplayName(
        member.user?.name ?? null,
        member.user?.email ?? member.email,
      ),
      selected: memberPublicIds.includes(member.publicId),
      // leftIcon: (
      //   <Avatar
      //     size="xs"
      //     name={member.user?.name ?? ""}
      //     imageUrl={
      //       member.user?.image ? getAvatarUrl(member.user.image) : undefined
      //     }
      //     email={member.user?.email ?? member.email}
      //   />
      // ),
    })) ?? [];

  const onSubmit = (data: NewCardInput) => {
    createCard.mutate({
      title: data.title,
      description: data.description,
      listPublicId: data.listPublicId,
      labelPublicIds: data.labelPublicIds,
      memberPublicIds: data.memberPublicIds,
      position: data.position,
    });
  };

  const handleToggleCreateAnother = (): void => {
    form.setValue("isCreateAnotherEnabled", !isCreateAnotherEnabled);
  };

  const handleSelectList = (listPublicId: string): void => {
    form.setValue("listPublicId", listPublicId);
  };

  const handleSelectMembers = (memberPublicId: string): void => {
    const currentIndex = memberPublicIds.indexOf(memberPublicId);
    if (currentIndex === -1) {
      form.setValue("memberPublicIds", [...memberPublicIds, memberPublicId]);
    } else {
      const newMemberPublicIds = [...memberPublicIds];
      newMemberPublicIds.splice(currentIndex, 1);
      form.setValue("memberPublicIds", newMemberPublicIds);
    }
  };

  const handleSelectLabels = (labelPublicId: string): void => {
    const currentIndex = labelPublicIds.indexOf(labelPublicId);
    if (currentIndex === -1) {
      form.setValue("labelPublicIds", [...labelPublicIds, labelPublicId]);
    } else {
      const newLabelPublicIds = [...labelPublicIds];
      newLabelPublicIds.splice(currentIndex, 1);
      form.setValue("labelPublicIds", newLabelPublicIds);
    }
  };

  const selectedList = formattedLists.find((item) => item.selected);

  const refetchBoard = async () => {
    if (boardPublicId) await utils.board.byId.refetch({ boardPublicId: boardPublicId });
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t`Enter your email adress`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2">
          <CheckboxDropdown
            items={formattedLists}
            handleSelect={(_groupKey, item) => handleSelectList(item.key)}
          >
            <Button variant="secondary" className="flex h-full w-full items-center">
              {selectedList?.value}
            </Button>
          </CheckboxDropdown>

          <CheckboxDropdown
            items={formattedMembers}
            handleSelect={(_groupKey, item) => handleSelectMembers(item.key)}
          >
            <Button variant="secondary" className="flex h-full w-full items-center">
              {!memberPublicIds.length ? (
                t`Members`
              ) : (
                <div className="flex -space-x-1 overflow-hidden">
                  {memberPublicIds.map((memberPublicId) => {
                    const member = formattedMembers.find(
                      (member) => member.key === memberPublicId,
                    );

                    return (
                      // <Avatar key={member?.key}>
                      //   <AvatarFallback>{member?.value
                      //     .split(" ")
                      //     .map((namePart) =>
                      //       namePart.charAt(0).toUpperCase(),
                      //     )
                      //     .join("")}</AvatarFallback>
                      // </Avatar>
                      <span
                        key={member?.key}
                        className="inline-flex size-5 items-center justify-center p-2 rounded-full bg-background"
                      >
                        <span className="text-base font-medium leading-none">
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
                </div>
              )}
            </Button>
          </CheckboxDropdown>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button className="flex h-full w-full items-center" variant="secondary">
                {!labelPublicIds.length ? (
                  t`Labels`
                ) : (
                  <>
                    <div
                      className={
                        labelPublicIds.length > 1
                          ? "flex -space-x-[2px] overflow-hidden"
                          : "flex items-center"
                      }
                    >
                      {labelPublicIds.map((labelPublicId) => {
                        const label = boardData?.labels.find(
                          (label) => label.publicId === labelPublicId,
                        );

                        return (
                          <>
                            <svg
                              fill={label?.colourCode ?? "#3730a3"}
                              className="h-2 w-2"
                              viewBox="0 0 6 6"
                              aria-hidden="true"
                            >
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                            {labelPublicIds.length === 1 && (
                              <div className="ml-1">{label?.name}</div>
                            )}
                          </>
                        );
                      })}
                    </div>
                    {labelPublicIds.length > 1 && (
                      <div className="ml-1">
                        <Trans>{`${labelPublicIds.length} labels`}</Trans>
                      </div>
                    )}
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {formattedLabels?.map((item, key) => {
                return (
                  <DropdownMenuItem key={key}>
                    <div
                      className="group flex items-center justify-between gap-2 w-full"
                    >
                      <Checkbox
                        id={item.key}
                        name={item.key}
                        onClick={(event) => { handleSelectLabels(item.key); event.stopPropagation(); }}
                        checked={item.selected} />
                      <label
                        htmlFor={item.key}
                        className="ml-3 text-[12px] text-dark-900"
                      >
                        {item.value}
                      </label>
                      <Dialog>
                        <DialogTrigger onClick={(event) => {
                          event.stopPropagation();
                        }}>
                          <Button variant="secondary" size="sm"><Pencil className="size-3" /></Button>
                        </DialogTrigger>
                        <DialogContent onClick={e => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                          <DialogHeader>
                            <DialogTitle>{t`Edit label`}</DialogTitle>
                          </DialogHeader>

                          <LabelForm
                            boardPublicId={boardPublicId || ""}
                            refetch={refetchBoard}
                            isEdit={true}
                            entityId={item.publicId}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuItem>
                <Dialog>
                  <DialogTrigger onClick={(event) => {
                    event.stopPropagation();
                  }}>
                    <div
                      className="flex w-full items-center"
                    >
                      <HiMiniPlus size={20} className="pr-1.5" />
                      {!labelPublicIds.length ? (
                        t`Labels`
                      ) : (
                        <>
                          <div
                            className={
                              labelPublicIds.length > 1
                                ? "flex -space-x-[2px] overflow-hidden"
                                : "flex items-center"
                            }
                          >
                            {labelPublicIds.map((labelPublicId) => {
                              const label = boardData?.labels.find(
                                (label) => label.publicId === labelPublicId,
                              );

                              return (
                                <>
                                  <svg
                                    fill={label?.colourCode ?? "#3730a3"}
                                    className="h-2 w-2"
                                    viewBox="0 0 6 6"
                                    aria-hidden="true"
                                  >
                                    <circle cx={3} cy={3} r={3} />
                                  </svg>
                                  {labelPublicIds.length === 1 && (
                                    <div className="ml-1">{label?.name}</div>
                                  )}
                                </>
                              );
                            })}
                          </div>
                          {labelPublicIds.length > 1 && (
                            <div className="ml-1">
                              <Trans>{`${labelPublicIds.length} labels`}</Trans>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent onClick={e => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>{t`Create label`}</DialogTitle>
                    </DialogHeader>

                    <LabelForm boardPublicId={boardPublicId ?? ""} refetch={refetchBoard} />
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="submit"
            disabled={title.length === 0 || createCard.isPending}
          >
            {t`Create card`}
          </Button>
        </div>

        {/* <Button
          onClick={(e) => {
            e.preventDefault();
            setValue("position", position === "start" ? "end" : "start");
          }}
          className="flex h-auto items-center rounded-[5px] border-[1px] border-light-600 bg-light-200 px-1.5 py-1 text-left text-xs text-light-800 hover:bg-light-300 focus-visible:outline-none dark:border-dark-600 dark:bg-dark-400 dark:text-dark-1000 dark:hover:bg-dark-500"
        >
          {position === "start" ? (
            <HiOutlineBarsArrowUp size={14} />
          ) : (
            <HiOutlineBarsArrowDown size={14} />
          )}
        </Button> */}
      </form>
    </Form>
  );
}
