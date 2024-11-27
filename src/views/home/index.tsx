import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { IoLogoGithub } from "react-icons/io";

import Button from "~/components/Button";
import PatternedBackground from "~/components/PatternedBackground";

import Pricing from "./components/Pricing";
import { api } from "~/utils/api";
import { env } from "~/env.mjs";

import { useTheme } from "~/providers/theme";

export default function HomeView() {
  const theme = useTheme();

  const token =
    typeof window !== "undefined"
      ? Cookies.get(env.NEXT_PUBLIC_SUPABASE_AUTH_COOKIE_NAME)
      : null;

  const { data } = api.auth.getUser.useQuery(undefined, {
    enabled: !!token,
  });

  const isLoggedIn = !!data;

  return (
    <>
      <style jsx global>{`
        body {
          background-color: ${theme.theme === "light"
            ? "hsl(0deg 0% 98.8%)"
            : "#161616"};
        }
      `}</style>
      <div className="mx-auto flex h-full min-h-screen flex-col items-center bg-light-100 dark:bg-dark-50">
        <PatternedBackground />
        <div className="z-10 mx-auto h-full w-full max-w-[1100px]">
          <div className="m-auto flex h-24 min-h-24 w-full items-center justify-between px-5 py-2 align-middle dark:border-dark-400">
            <div className="my-auto flex items-center justify-between">
              <h1 className="w-[100px] text-xl font-bold tracking-tight text-neutral-900 dark:text-dark-1000">
                kan.bn
              </h1>
            </div>
            <div className="flex w-full justify-center gap-10 dark:text-dark-1000">
              <Link href="/roadmap" className="text-sm font-bold">
                Roadmap
              </Link>
              <Link href="#features" className="text-sm font-bold">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-bold">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm font-bold">
                Docs
              </Link>
            </div>
            <div className="flex w-[100px] gap-2">
              {isLoggedIn ? (
                <Button href="/boards">Go to app</Button>
              ) : (
                <>
                  <Button href="/login" variant="ghost">
                    Sign in
                  </Button>
                  <Button href="/signup">Get started</Button>
                </>
              )}
            </div>
          </div>

          <div className="flex h-full w-full flex-col">
            <div className="w-full py-32">
              <div className="my-10 flex h-full w-full flex-col items-center justify-center ">
                <div className="relative overflow-hidden rounded-full bg-gradient-to-b from-light-300 to-light-400 p-[2px] dark:from-dark-300 dark:to-dark-400">
                  <div className="gradient-border animate-border-spin absolute inset-0" />
                  <div className="relative z-10 rounded-full bg-light-50 dark:bg-dark-50">
                    <Link
                      href="https://github.com/kanbn/kan"
                      rel="noopener noreferrer"
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-1 text-center text-sm text-light-1000 dark:text-dark-1000"
                    >
                      Star on Github
                      <IoLogoGithub size={20} />
                    </Link>
                  </div>
                </div>

                <p className="mt-2 text-center text-5xl font-bold text-light-1000 dark:text-dark-1000">
                  The open source <br />
                  alternative to Trello
                </p>

                <p className="mt-3 max-w-[600px] text-center text-lg text-dark-900">
                  A powerful, flexible kanban app that helps you organise work,
                  track progress, and deliver results—all in one place.
                </p>

                <div className="mt-6 flex gap-2">
                  <Button href="/signup">Get started on Cloud</Button>
                  <Button
                    variant="secondary"
                    href="https://github.com/kanbn/kan"
                    openInNewTab
                  >
                    Self host with Github
                  </Button>
                </div>
                <p className="mt-4 text-center text-sm text-dark-900">
                  No credit card required
                </p>
              </div>
            </div>
            <div className="mb-10 rounded-[24px] border border-light-300 bg-light-50 p-2 shadow-md dark:border-dark-300 dark:bg-dark-50">
              <div className="rounded-[16px] border border-light-300 bg-light-200 p-2 dark:border-dark-300 dark:bg-dark-200">
                <div className="overflow-hidden rounded-[16px] shadow-sm">
                  <Image
                    src={`/hero-${theme.theme}.png`}
                    alt="kanban"
                    width={1100}
                    height={1000}
                  />
                </div>
              </div>
            </div>
            <div className="pt-10" id="pricing">
              <Pricing />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
