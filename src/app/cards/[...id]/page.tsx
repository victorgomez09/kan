"use client";

import { useParams } from "next/navigation";
import { useFormik } from "formik";
import ContentEditable from "react-contenteditable";

import Dropdown from "./components/Dropdown";
import { DeleteCardConfirmation } from "./components/DeleteCardConfirmation";
import LabelSelector from "./components/LabelSelector";
import { NewLabelForm } from "./components/NewLabelForm";

import Modal from "~/app/_components/modal";
import { useModal } from "~/app/providers/modal";

import { api } from "~/trpc/react";

interface FormValues {
  cardId: string;
  title: string;
  description: string;
}

export default function CardPage() {
  const params = useParams();
  const { modalContentType } = useModal();

  const cardId = params?.id?.length ? params.id[0] : null;

  const { data } = api.card.byId.useQuery({ id: cardId ?? "" });

  const boardId = data?.list?.board?.publicId;
  const labels = data?.list?.board?.labels;
  const selectedLabels = data?.labels;

  const formattedLabels =
    labels?.map((label) => {
      const isSelected = selectedLabels?.some(
        (selectedLabel) => selectedLabel.label.publicId === label.publicId,
      );

      return {
        ...label,
        selected: isSelected ?? false,
        colourCode: label.colourCode ?? "",
      };
    }) ?? [];

  const updateCard = api.card.update.useMutation();

  const formik = useFormik({
    initialValues: {
      cardId: cardId ?? "",
      title: data?.title ? data.title : "",
      description: data?.description ? data.description : "",
    },
    onSubmit: (values: FormValues) => {
      updateCard.mutate({
        cardId: values.cardId,
        title: values.title,
        description: values.description,
      });
    },
    enableReinitialize: true,
  });

  if (!cardId) return <></>;

  return (
    <div className="flex h-full flex-1 flex-row">
      <div className="w-full p-8">
        <div className="mb-8 flex w-full justify-between">
          <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
            <div>
              <input
                type="text"
                id="title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.submitForm}
                className="block w-full border-0 bg-transparent p-0 py-0 font-medium tracking-tight text-dark-1000 focus:ring-0 sm:text-[1.2rem] sm:leading-6"
              />
            </div>
          </form>
          <div className="flex">
            <Dropdown />
          </div>
        </div>
        <div className="mb-8 flex w-full max-w-2xl justify-between">
          <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
            <div className="mt-2">
              <ContentEditable
                html={formik.values.description || "Add description..."}
                disabled={false}
                onChange={(e) =>
                  formik.setFieldValue("description", e.target.value)
                }
                onBlur={formik.submitForm}
                className="block w-full border-0 bg-transparent py-1.5 text-dark-1000 focus-visible:outline-none sm:text-sm sm:leading-6"
              />
            </div>
          </form>
        </div>
      </div>
      <div className="min-w-[325px] border-l-[1px] border-dark-400 bg-dark-100 p-8 text-dark-900">
        <div className="flex w-full">
          <p className="my-2 pr-8 text-sm">Labels</p>
          <LabelSelector cardPublicId={cardId} labels={formattedLabels} />
        </div>
      </div>

      <Modal>
        {modalContentType === "NEW_LABEL" && (
          <NewLabelForm cardPublicId={cardId} />
        )}
        {modalContentType === "DELETE_CARD" && (
          <DeleteCardConfirmation
            boardPublicId={boardId ?? ""}
            cardPublicId={cardId}
          />
        )}
      </Modal>
    </div>
  );
}
