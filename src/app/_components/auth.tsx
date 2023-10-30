"use client";

import { Formik, Form, Field } from "formik";
import { signIn } from "next-auth/react";

interface FormValues {
  email: string;
}

export function Login() {
  return (
    <Formik
      initialValues={{
        email: "",
      }}
      onSubmit={async (values: FormValues) => {
        await signIn("email", { email: values.email });
      }}
    >
      <Form className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="text-dark-1000 block text-sm font-normal leading-6"
          >
            Email address
          </label>
          <div className="mt-2">
            <Field
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="bg-dark-500 focus:ring-dark-900 ring-dark-900 text-dark-1000 block w-full rounded-md border-0 bg-white/5 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="bg-dark-1000 text-dark-50 focus-visible:outline-offset- flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2"
          >
            Sign up
          </button>
        </div>
      </Form>
    </Formik>
  );
}
