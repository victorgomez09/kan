"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

import { HiXMark } from "react-icons/hi2";
import { Switch } from "@headlessui/react";

import { useBoard } from "~/app/providers/board";
import { useModal } from "~/app/providers/modal";

import { Formik, Form, Field } from "formik";

interface FormValues {
  title: string;
}

interface listPublicId {
  listPublicId: string;
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export function NewCardForm({ listPublicId }: listPublicId) {
  const utils = api.useUtils();
  const { boardData } = useBoard();
  const { closeModal } = useModal();
  const [isCreateAnotherEnabled, setIsCreateAnotherEnabled] = useState(false);

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

      <Formik
        initialValues={{
          title: "",
        }}
        onSubmit={(values: FormValues, { resetForm }) => {
          createCard.mutate({
            title: values.title,
            listPublicId,
          });
          resetForm();
        }}
      >
        <Form>
          <label
            htmlFor="title"
            className="block pb-2 text-sm font-normal leading-6 text-dark-1000"
          >
            Title
          </label>
          <Field
            id="title"
            name="title"
            className="block w-full rounded-md border-0 bg-dark-300 bg-white/5 py-1.5 text-dark-1000 shadow-sm ring-1 ring-inset ring-dark-700 focus:ring-2 focus:ring-inset focus:ring-dark-700 sm:text-sm sm:leading-6"
          />
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
        </Form>
      </Formik>
    </>
  );
}
