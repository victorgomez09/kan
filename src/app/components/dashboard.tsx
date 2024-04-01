import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import SideNavigation from "./SideNavigation";
import FeedbackButton from "./FeedbackButton";

export default async function Dashboard(props: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="bg-light-100 flex h-screen flex-col items-center dark:bg-dark-50">
      <div className="border-light-600 m-auto flex h-16 w-full justify-between border-b px-5 py-2 align-middle dark:border-dark-600">
        <div className="my-auto flex w-full items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-dark-1000">
            kan.bn
          </h1>
          <FeedbackButton />
        </div>
      </div>

      <div className="flex h-full w-full">
        <SideNavigation user={session.user} />
        <div className="w-full overflow-hidden">{props.children}</div>
      </div>
    </main>
  );
}
