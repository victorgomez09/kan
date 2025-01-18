import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import Button from "~/components/Button";

const Header = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={twMerge(
          "z-50 m-auto flex w-full max-w-[1100px] px-4 pt-4",
          isScrolled && "fixed",
        )}
      >
        <div
          className={twMerge(
            "m-auto flex h-[4rem] min-h-[4rem] w-full rounded-3xl border border-transparent px-5 py-2 align-middle transition-colors duration-200",
            isScrolled &&
              "rounded-2xl border border-light-300 bg-dark-100 bg-light-50/80 shadow-sm backdrop-blur-[10px] dark:border-dark-300 dark:bg-dark-50/90",
          )}
        >
          <div className="flex w-full items-center justify-between px-2">
            <div className="my-auto flex items-center justify-between pl-2">
              <h1 className="w-[200px] text-lg font-bold tracking-tight text-neutral-900 dark:text-dark-1000">
                kan.bn
              </h1>
            </div>
            <div className="flex justify-center gap-10 dark:text-dark-1000">
              <Link href="/kan/roadmap" className="text-sm font-bold">
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
            <div className="flex w-[200px] justify-end gap-2">
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
        </div>
      </div>
      {isScrolled && <div className="h-[5rem] min-h-[5rem]"></div>}
    </>
  );
};

export default Header;
