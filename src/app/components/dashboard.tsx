import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import boardsIcon from "~/app/assets/boards.json";

import ReactiveButton from "~/app/components/ReactiveButton";
import UserMenu from "~/app/components/UserMenu";

const navigation = [
  { name: "Boards", href: "/boards", icon: boardsIcon, current: true },
];

export default async function Layout(props: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

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
          <UserMenu
            email={session?.user.email ?? ""}
            imageUrl={session?.user.image ?? undefined}
          />
        </nav>
        <div className="w-full overflow-hidden">{props.children}</div>
      </div>
    </main>
  );
}
