import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { IoLogoGithub } from "react-icons/io";

import Button from "~/components/Button";
import PatternedBackground from "~/components/PatternedBackground";
import { env } from "~/env";
import { useTheme } from "~/providers/theme";
import { api } from "~/utils/api";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Pricing from "./components/Pricing";

export default function HomeView() {
  const theme = useTheme();

  const token =
    typeof window !== "undefined"
      ? Cookies.get(env.NEXT_PUBLIC_SUPABASE_AUTH_COOKIE_NAME)
      : null;

  const { data } = api.user.getUser.useQuery(undefined, {
    enabled: !!token,
  });

  const isLoggedIn = !!data;

  const isDarkMode = theme.activeTheme === "dark";

  return (
    <>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        body {
          background-color: ${!isDarkMode ? "hsl(0deg 0% 98.8%)" : "#161616"};
        }
      `}</style>
      <div className="mx-auto flex h-full min-h-screen min-w-[375px] flex-col items-center bg-light-100 dark:bg-dark-50">
        <PatternedBackground />
        <div className="z-10 mx-auto h-full w-full max-w-[1100px]">
          <Header isLoggedIn={isLoggedIn} />
          <div className="flex h-full w-full flex-col lg:pt-[5rem]">
            <div className="w-full pb-10 pt-32 lg:py-32">
              <div className="my-10 flex h-full w-full flex-col items-center justify-center px-4">
                <div className="relative overflow-hidden rounded-full bg-gradient-to-b from-light-300 to-light-400 p-[2px] dark:from-dark-300 dark:to-dark-400">
                  <div className="gradient-border absolute inset-0 animate-border-spin" />
                  <div className="relative z-10 rounded-full bg-light-50 dark:bg-dark-50">
                    <Link
                      href="https://github.com/kanbn/kan"
                      rel="noopener noreferrer"
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-1 text-center text-xs text-light-1000 dark:text-dark-1000 lg:text-sm"
                    >
                      Star on Github
                      <IoLogoGithub size={20} />
                    </Link>
                  </div>
                </div>

                <p className="mt-2 text-center text-4xl font-bold text-light-1000 dark:text-dark-1000 lg:text-5xl">
                  The open source <br />
                  alternative to Trello
                </p>

                <p className="text-md mt-3 max-w-[450px] text-center text-dark-900 lg:max-w-[600px] lg:text-lg">
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
            <div className="px-4">
              <div className="mb-24 rounded-[24px] border border-light-300 bg-light-50 p-2 shadow-md dark:border-dark-300 dark:bg-dark-100">
                <div className="overflow-hidden rounded-[16px] border border-light-300 shadow-sm dark:border-dark-300">
                  <Image
                    src={`/hero-${isDarkMode ? "dark" : "light"}.png`}
                    alt="kanban"
                    width={1100}
                    height={1000}
                  />
                </div>
              </div>
            </div>
            <div className="relative pt-10">
              <div id="features" className="absolute -top-20" />
              <Features theme={theme.activeTheme} />
            </div>
            <div className="relative pt-10">
              <div id="pricing" className="absolute -top-20" />
              <Pricing />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
