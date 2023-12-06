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
            <ul role="list" className="-mx-2 my-6 space-y-1">
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
            ) : null}
            <p className="ml-2 truncate text-sm text-dark-1000">
              {session?.user.email}
            </p>
          </button>
        </nav>
        <div className="w-full overflow-hidden py-8 pl-8">{props.children}</div>
      </div>
    </main>
  );
}
