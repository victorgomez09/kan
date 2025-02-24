import Cookies from "js-cookie";

import PatternedBackground from "~/components/PatternedBackground";
import { env } from "~/env";
import { useTheme } from "~/providers/theme";
import { api } from "~/utils/api";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
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
          background-color: ${!isDarkMode ? "hsl(0deg 0% 97.3%)" : "#161616"};
        }
      `}</style>
      <div className="mx-auto flex h-full min-h-screen min-w-[375px] flex-col items-center bg-light-100 dark:bg-dark-50">
        <PatternedBackground />
        <div className="z-10 mx-auto h-full w-full max-w-[1100px]">
          <Header isLoggedIn={isLoggedIn} />
          {children}
        </div>
        <Footer />
      </div>
    </>
  );
}
