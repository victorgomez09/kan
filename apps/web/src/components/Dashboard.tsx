import Link from "next/link";

import { api } from "~/utils/api";
import FeedbackButton from "./FeedbackButton";
import SideNavigation from "./SideNavigation";

export default function Dashboard(props: { children: React.ReactNode }) {
  const { data, isLoading } = api.user.getUser.useQuery();

  return (
    <>
      <style jsx global>{`
        html {
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
      <div className="flex h-screen flex-col items-center bg-light-100 dark:bg-dark-50">
        <div className="m-auto flex h-16 min-h-16 w-full justify-between border-b border-light-600 px-5 py-2 align-middle dark:border-dark-400">
          <div className="my-auto flex w-full items-center justify-between">
            <Link href="/">
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-dark-1000">
                kan.bn
              </h1>
            </Link>
            <FeedbackButton />
          </div>
        </div>

        <div className="flex h-full w-full">
          <SideNavigation
            user={{ email: data?.email, image: data?.image }}
            isLoading={isLoading}
          />
          <div className="w-full overflow-hidden">{props.children}</div>
        </div>
      </div>
    </>
  );
}
