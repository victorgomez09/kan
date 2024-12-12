import { useState } from "react";
// import { useRouter } from "next/navigation";
import { Auth } from "~/components/AuthForm";
import { PageHead } from "~/components/PageHead";
// import { api } from "~/utils/api";

export default function SignupPage() {
  // const router = useRouter();
  const [isMagicLinkSent, setIsMagicLinkSent] = useState<boolean>(false);
  const [magicLinkRecipient, setMagicLinkRecipient] = useState<string>("");

  const handleMagicLinkSent = (value: boolean, recipient: string) => {
    setIsMagicLinkSent(value);
    setMagicLinkRecipient(recipient);
  };

  // const authCookieExists = document.cookie
  //   .split("; ")
  //   .some((cookie) => cookie.includes("auth-token"));

  // const { data } = api.auth.getUser.useQuery(undefined, {
  //   enabled: authCookieExists ? true : false,
  // });

  // if (data?.id) router.push("/boards");

  return (
    <>
      <PageHead title="Signup | kan.bn" />
      <main className="h-screen bg-dark-50">
        <div className="flex h-full flex-col items-center justify-center">
          <h1 className="mb-6 text-lg font-bold tracking-tight text-dark-1000">
            kan.bn
          </h1>
          <p className="mb-10 text-3xl text-dark-1000">
            {isMagicLinkSent ? "Check your inbox" : "Get started"}
          </p>
          {isMagicLinkSent ? (
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <p className="text-md mt-2 text-center text-dark-1000">
                {`Click on the link we've sent to ${magicLinkRecipient} to sign in.`}
              </p>
            </div>
          ) : (
            <div className="w-full rounded-lg border border-dark-400 bg-dark-200 px-10 py-10 sm:max-w-md">
              <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Auth setIsMagicLinkSent={handleMagicLinkSent} />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
