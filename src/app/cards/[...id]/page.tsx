"use client";

import { useParams } from "next/navigation";
import { HiOutlinePlusSmall } from "react-icons/hi2";
import { Formik, Form, Field, type FieldProps } from "formik";

import { api } from "~/trpc/react";

interface FormValues {
  cardId: string;
  description: string;
}

export default function CardPage() {
  const params = useParams();

  const cardId = params?.id?.length && params.id[0];

  if (!cardId) return <></>;

  const { data } = api.card.byId.useQuery({ id: cardId });

  const updateCard = api.card.updateDescription.useMutation();

  return (
    <div>
      <div className="mb-8 flex w-full justify-between">
        <h1 className="font-medium tracking-tight text-dark-1000 sm:text-[1.2rem]">
          {data?.title}
        </h1>
        <div>
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <HiOutlinePlusSmall
              className="-mr-0.5 h-5 w-5"
              aria-hidden="true"
            />
            New
          </button>
        </div>
      </div>
      <div className="mb-8 flex w-full max-w-2xl justify-between">
        <Formik
          initialValues={{
            cardId,
            description: data?.description ? data.description : "",
          }}
          onSubmit={(values: FormValues) => {
            updateCard.mutate({
              cardId: values.cardId,
              description: values.description,
            });
          }}
          enableReinitialize
        >
          <Form className="w-full space-y-6">
            <div>
              <div className="mt-2">
                <Field
                  id="description"
                  name="description"
                  render={({ field, form }: FieldProps) => (
                    <div
                      onBlur={() => form.submitForm()}
                      onInput={async (e) => {
                        const { innerText } = e.target as HTMLDivElement;
                        await form.setFieldValue("description", innerText);
                      }}
                      contentEditable
                      className="block w-full border-0 bg-transparent py-1.5 text-dark-1000 focus-visible:outline-none sm:text-sm sm:leading-6"
                    >
                      {field.value || "Add description..."}
                    </div>
                  )}
                />
              </div>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
}
