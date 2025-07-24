import Link from "next/link";
import { Listbox, Transition } from "@headlessui/react";
import { t } from "@lingui/core/macro";
import { Plural, Trans } from "@lingui/react/macro";
import { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaTrello } from "react-icons/fa";
import {
  HiChevronUpDown,
  HiMiniArrowTopRightOnSquare,
  HiOutlineQuestionMarkCircle,
  HiXMark,
} from "react-icons/hi2";
import { Button } from "~/components/ui/button";
import Toggle from "~/components/Toggle";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

const integrationProviders: Record<
  string,
  { name: string; icon: JSX.Element }
> = {
  trello: {
    name: "Trello",
    icon: <FaTrello />,
  },
};

const SelectSource = ({ handleNextStep }: { handleNextStep: () => void }) => {
  const { data: integrations, refetch: refetchIntegrations } =
    api.integration.providers.useQuery();

  const form = useForm({
    defaultValues: {
      source: integrations?.[0]?.provider ?? "trello",
    },
  });

  const { data: trelloUrl } = api.integration.getAuthorizationUrl.useQuery(
    { provider: "trello" },
    {
      enabled: !integrations?.some(
        (integration) => integration.provider === "trello",
      ),
    },
  );

  const hasIntegrations = integrations && integrations.length > 0;

  useEffect(() => {
    const handleFocus = () => {
      refetchIntegrations();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchIntegrations]);

  const onSubmit = () => {
    if (!hasIntegrations && trelloUrl) {
      window.open(trelloUrl.url, "trello_auth", "height=800,width=600");
    } else {
      handleNextStep();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      {integrationProviders[field.value]?.icon}
                      <span className="ml-2 block truncate text-sm">
                        {integrationProviders[field.value]?.name}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Controller
            name="source"
            control={form.control}
            render={({ field }) => (
              <Listbox {...field}>
                {({ open }) => (
                  <>
                    <div className="relative">
                      <Listbox.Button className="focus-ring-light-700 block w-full rounded-md border-0 bg-dark-300 bg-white/5 px-4 py-1.5 text-neutral-900 shadow-sm ring-1 ring-inset ring-light-600 focus:ring-2 focus:ring-inset dark:text-dark-1000 dark:ring-dark-700 dark:focus:ring-dark-700 sm:text-sm sm:leading-6">
                        <span className="flex items-center">
                          {integrationProviders[field.value]?.icon}
                          <span className="ml-2 block truncate text-sm">
                            {integrationProviders[field.value]?.name}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <HiChevronUpDown
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-light-50 py-1 text-base text-neutral-900 shadow-lg ring-1 ring-light-600 ring-opacity-5 focus:outline-none dark:bg-dark-300 dark:text-dark-1000 sm:text-sm">
                          {hasIntegrations ? (
                            integrations.map((integration, index) => (
                              <Listbox.Option
                                key={`source_${index}`}
                                className="relative cursor-default select-none px-1"
                                value={integration.provider}
                              >
                                <div className="flex items-center rounded-[5px] p-1 hover:bg-light-200 dark:hover:bg-dark-400">
                                  {
                                    integrationProviders[integration.provider]
                                      ?.icon
                                  }
                                  <span className="ml-2 block truncate text-sm font-normal">
                                    {
                                      integrationProviders[integration.provider]
                                        ?.name
                                    }
                                  </span>
                                </div>
                              </Listbox.Option>
                            ))
                          ) : (
                            <Listbox.Option
                              key="trello_placeholder"
                              className="font-sm relative cursor-default select-none px-1"
                              value="trello"
                            >
                              <div className="flex items-center rounded-[5px] p-1 text-sm hover:bg-light-200 dark:hover:bg-dark-400">
                                {integrationProviders.trello?.icon}
                                <span className="ml-2 block truncate text-sm">
                                  {integrationProviders.trello?.name}
                                </span>
                              </div>
                            </Listbox.Option>
                          )}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            )}
          /> */}

        <div className="mt-12 flex items-center justify-end border-t border-light-600 px-5 pb-5 pt-5 dark:border-dark-600">
          <div>
            <Button
              type="submit"
            >
              {hasIntegrations ? t`Select source` : t`Connect Trello`}
              {!hasIntegrations && <HiMiniArrowTopRightOnSquare />}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

const ImportTrello: React.FC = () => {
  const utils = api.useUtils();
  const { closeModal } = useModal();
  const { workspace } = useWorkspace();
  const { showPopup } = usePopup();
  const [isSelectAllEnabled, setIsSelectAllEnabled] = useState(false);

  const refetchBoards = () => utils.board.all.refetch();

  const { data: boards, isLoading: boardsLoading } =
    api.import.trello.getBoards.useQuery();

  const form = useForm({
    defaultValues: Object.fromEntries(
      boards?.map((board) => [board.id, true]) ?? [],
    ),
  });

  const importBoards = api.import.trello.importBoards.useMutation({
    onSuccess: async () => {
      showPopup({
        header: t`Import complete`,
        message: t`Your boards have been imported.`,
        icon: "success",
      });
      try {
        await refetchBoards();
        closeModal();
      } catch (e) {
        console.log(e);
      }
    },
    onError: () => {
      showPopup({
        header: t`Import failed`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      });
    },
  });

  const boardWatchers = boards?.map((board) => ({
    id: board.id,
    value: form.watch(board.id),
  }));

  const boardCount = boardWatchers?.filter((w) => w.value === true).length || 0;

  const onSubmitBoards = (values: Record<string, boolean>) => {
    const boardIds = Object.keys(values).filter((key) => values[key] === true);

    importBoards.mutate({
      boardIds,
      workspacePublicId: workspace.publicId,
    });
  };

  const renderContent = () => {
    if (boardsLoading) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1">
          <div className="h-[30px] w-full animate-pulse rounded-[5px] bg-light-200 dark:bg-dark-300" />
          <div className="h-[30px] w-full animate-pulse rounded-[5px] bg-light-200 dark:bg-dark-300" />
          <div className="h-[30px] w-full animate-pulse rounded-[5px] bg-light-200 dark:bg-dark-300" />
        </div>
      );
    }

    if (!boards?.length) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-neutral-500 dark:text-dark-900">
            {t`No boards found`}
          </p>
        </div>
      );
    }

    return boards.map((board) => (
      <div key={board.id}>
        <label
          className="flex cursor-pointer items-center rounded-[5px] p-2 hover:bg-light-100 dark:hover:bg-dark-300"
          htmlFor={board.id}
        >
          <input
            id={board.id}
            type="checkbox"
            className="h-[14px] w-[14px] rounded bg-transparent ring-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
            {...form.register(board.id)}
          />
          <span className="ml-3 text-sm text-neutral-900 dark:text-dark-1000">
            {board.name}
          </span>
        </label>
      </div>
    ));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmitBoards)}>
      <div className="h-[105px] overflow-scroll px-5">{renderContent()}</div>

      <div className="mt-12 flex items-center justify-end border-t border-light-600 px-5 pb-5 pt-5 dark:border-dark-600">
        <Toggle
          label={t`Select all`}
          isChecked={!!isSelectAllEnabled}
          onChange={() => {
            const newState = !isSelectAllEnabled;
            setIsSelectAllEnabled(newState);

            for (const board of boards || []) {
              form.setValue(board.id, newState);
            }
          }}
        />
        <div className="space-x-2">
          <Button
            type="submit"
            isLoading={importBoards.isPending}
            disabled={
              importBoards.isPending ||
              boardsLoading ||
              !boards?.length ||
              !boards.some(
                (board) =>
                  boardWatchers?.find((w) => w.id === board.id)?.value === true,
              )
            }
          >
            <Trans>
              <Plural
                value={boardCount}
                one={`Import board (1)`}
                other={`Import boards (${boardCount})`}
              />
            </Trans>
          </Button>
        </div>
      </div>
    </form>
  );
};

export function ImportBoardsForm() {
  const [step, setStep] = useState(1);

  return (
    <div>
      {step === 1 && <SelectSource handleNextStep={() => setStep(step + 1)} />}
      {step === 2 && <ImportTrello />}
    </div>
  );
}
