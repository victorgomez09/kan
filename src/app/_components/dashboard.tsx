import Image from "next/image";
import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import boardsIcon from "~/app/assets/boards.json";

import ReactiveButton from "~/app/components/ReactiveButton";

const navigation = [
  { name: "Boards", href: "/boards", icon: boardsIcon, current: true },
];

export default async function Layout(props: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user) redirect("api/auth/signin");

  return (
    <main className="flex h-screen flex-col items-center bg-dark-50">
      <div className="m-auto flex h-16 w-full justify-between border-b border-dark-600 px-5 py-2 align-middle">
        <div className="my-auto flex">
          <h1 className="text-lg font-normal tracking-tight text-dark-1000">
            貫 kan
          </h1>
        </div>
      </div>

      <div className="flex h-full w-full">
        <nav className="flex w-72 flex-col justify-between border-r border-dark-600 px-5 py-5">
          <div>
            <ul role="list" className="-mx-2 my-3 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <ReactiveButton
                    href={item.href}
                    current={item.current}
                    name={item.name}
                    json={item.icon}
                  />
                </li>
              ))}
            </ul>
          </div>
          <button className="flex items-center">
            {session?.user.image ? (
              <Image
                src={session?.user.image ?? ""}
                className="h-8 w-8 rounded-full bg-gray-50"
                width={30}
                height={30}
                alt=""
              />
            ) : (
              <span className="inline-block h-6 w-6 overflow-hidden rounded-full bg-dark-400">
                <svg
                  className="h-full w-full text-dark-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            )}
            <p className="ml-2 truncate text-sm text-dark-900">
              {session?.user.email}
            </p>
          </button>
        </nav>

        <div className="w-full overflow-hidden">{props.children}</div>
      </div>
    </main>
  );
}
