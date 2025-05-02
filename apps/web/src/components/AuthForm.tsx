import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa";
import { z } from "zod";

import { authClient } from "@kan/auth";

import Button from "~/components/Button";
import Input from "~/components/Input";
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
      if (data.url) window.open(data.url);
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
        <Button
          onClick={() =>
            authClient.signIn.social({
              provider: "google",
              callbackURL: "/boards",
            })
          }
          iconLeft={<FaGoogle />}
          fullWidth
          size="lg"
        >
          Continue with Google
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-[1.5rem] flex w-full items-center gap-4">
          <div className="h-[1px] w-full bg-light-600 dark:bg-dark-600" />
          <span className="text-sm text-light-900 dark:text-dark-900">or</span>
          <div className="h-[1px] w-full bg-light-600 dark:bg-dark-600" />
        </div>
        <Input
          {...register("email", { required: true })}
          placeholder="Enter your email address"
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
          <Button
            isLoading={loginWithEmail.isPending}
            fullWidth
            size="lg"
            variant="secondary"
          >
            Continue with email
          </Button>
        </div>
      </form>
    </div>
  );
}
