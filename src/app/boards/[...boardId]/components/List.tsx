"use client";

import { type ReactNode } from "react";
import { HiOutlinePlusSmall } from "react-icons/hi2";
import { Draggable } from "react-beautiful-dnd";
import { useFormik } from "formik";

import { api } from "~/trpc/react";
import { useModal } from "~/app/providers/modal";

import ListDropdown from "./ListDropdown";

interface ListProps {
  children: ReactNode;
  index: number;
  list: List;
  setSelectedPublicListId: (publicListId: PublicListId) => void;
}

interface List {
  publicId: string;
  name: string;
}

interface FormValues {
  listPublicId: string;
  name: string;
}

type PublicListId = string;

export default function List({
  children,
  index,
  list,
  setSelectedPublicListId,
}: ListProps) {
  const { openModal } = useModal();

  const openNewCardForm = (publicListId: PublicListId) => {
    openModal("NEW_CARD");
    setSelectedPublicListId(publicListId);
  };

  const updateList = api.list.update.useMutation();

  const formik = useFormik({
    initialValues: {
      listPublicId: list.publicId,
      name: list.name,
    },
    onSubmit: (values: FormValues) => {
      updateList.mutate({
        listPublicId: values.listPublicId,
        name: values.name,
      });
    },
    enableReinitialize: true,
  });

  return (
    <Draggable key={list.publicId} draggableId={list.publicId} index={index}>
      {(provided) => (
        <div
          key={list.publicId}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mr-5 h-fit min-w-[18rem] max-w-[18rem] rounded-md border border-dark-400 bg-dark-200 py-2 pl-2 pr-1"
        >
          <div className="flex justify-between">
            <form
              onSubmit={formik.handleSubmit}
              className="focus-visible:outline-none"
            >
              <input
                type="name"
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.submitForm}
                className="mb-4 block border-0 bg-transparent px-4 pt-1 text-sm font-medium text-dark-1000 focus:ring-0 focus-visible:outline-none"
              />
            </form>
            <div>
              <button
                className="mx-1 inline-flex h-fit items-center rounded-md p-1 px-1 text-sm font-semibold text-dark-50 hover:bg-dark-400"
                onClick={() => openNewCardForm(list.publicId)}
              >
                <HiOutlinePlusSmall
                  className="h-5 w-5 text-dark-900"
                  aria-hidden="true"
                />
              </button>
              <ListDropdown
                setSelectedPublicListId={() =>
                  setSelectedPublicListId(list.publicId)
                }
              />
            </div>
          </div>
          {children}
        </div>
      )}
    </Draggable>
  );
}
