import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import { z } from "zod";

import LoadingSpinner from "~/components/LoadingSpinner";
import { api } from "~/utils/api";

interface FormValues {
  email: string;
}

interface AuthProps {
  setIsMagicLinkSent: (value: boolean, recipient: string) => void;
}

const EmailSchema = z.object({ email: z.string().email() });

export function Auth({ setIsMagicLinkSent }: AuthProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(EmailSchema), // Apply the zodResolver
  });

  const email = watch("email");

  const loginWithEmail = api.auth.loginWithEmail.useMutation({
    onSuccess: () => {
      setIsMagicLinkSent(true, email);
    },
  });

  const loginWithOAuth = api.auth.loginWithOAuth.useMutation({
    onSuccess: (data) => {
      if (data?.url) window.open(data.url);
    },
  });

  const onSubmit = (values: FormValues) => {
    try {
      loginWithEmail.mutate({
        email: values.email,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => loginWithOAuth.mutate({ provider: "google" })}
          className="flex w-full items-center justify-center rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold leading-6 text-dark-50 shadow-sm focus-visible:outline focus-visible:outline-2"
        >
          <FaGoogle className="mr-2" /> Continue with Google
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-[1.5rem] h-[1px] w-full bg-dark-600" />
        <input
          {...register("email", { required: true })}
          placeholder="Enter your email address"
          autoComplete="email"
          className="block w-full rounded-md border-0 bg-dark-500 bg-white/5 py-2 text-dark-1000 shadow-sm ring-1 ring-inset ring-dark-600 focus:ring-inset focus:ring-dark-800 sm:text-sm sm:leading-6"
        />
        {!loginWithEmail.error && !loginWithOAuth.error && errors.email && (
          <p className="mt-2 text-xs text-red-400">
            Please enter a valid email address
          </p>
        )}
        {(loginWithEmail.error ?? loginWithOAuth.error) ? (
          <p className="mt-2 text-xs text-red-400">
            Something went wrong, please try again later or contact customer
            support.
          </p>
        ) : null}

        <div className="mt-[1.5rem]">
          <button
            type="submit"
            disabled={loginWithEmail.isPending}
            className="flex w-full items-center justify-center rounded-md bg-dark-600 px-3 py-2 text-sm font-semibold leading-6 text-dark-1000 shadow-sm focus-visible:outline focus-visible:outline-2"
          >
            {loginWithEmail.isPending ? (
              <LoadingSpinner />
            ) : (
              "Continue with email"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
