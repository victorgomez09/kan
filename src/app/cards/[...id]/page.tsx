"use client";

import { useParams } from "next/navigation";
import { useFormik } from "formik";
import ContentEditable from "react-contenteditable";

import { api } from "~/trpc/react";

interface FormValues {
  cardId: string;
  title: string;
  description: string;
}

export default function CardPage() {
  const params = useParams();

  const cardId = params?.id?.length ? params.id[0] : null;

  const { data } = api.card.byId.useQuery({ id: cardId ?? "" });

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
    <div>
      <div className="mb-8 flex w-full justify-between">
        <form onSubmit={formik.handleSubmit} className="w-full space-y-6">
          <div className="mt-2">
            <input
              type="text"
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.submitForm}
              className="block w-full border-0 bg-transparent p-0 py-1.5 font-medium tracking-tight text-dark-1000 focus:ring-0 sm:text-[1.2rem] sm:leading-6"
            />
          </div>
        </form>
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
  );
}
