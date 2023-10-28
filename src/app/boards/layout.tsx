import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

const navigation = [
  { name: "Boards", href: "/boards", icon: null, current: true },
];

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

const NavButton: React.FC<{
  href: string;
  current: boolean;
  name: string;
}> = ({ href, current, name }) => (
  <Link
    href={href}
    className={classNames(
      current ? "bg-dark-400 text-white" : "bg-dark-400 text-white",
      "text-dark-1000 group flex items-center gap-x-3 rounded-md p-1.5 text-sm font-normal leading-6",
    )}
  >
    {name}
  </Link>
);

export default async function Layout(props: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user) redirect("api/auth/signin");

  return (
    <main className="bg-dark-50 flex h-screen flex-col items-center">
      <div className="border-dark-600 m-auto flex h-16 w-full justify-between border-b px-5 py-2 align-middle">
        <div className="my-auto flex">
          <h1 className="text-dark-1000 text-lg font-normal tracking-tight">
            貫 kan
          </h1>
        </div>
      </div>

      <div className="flex h-full w-full">
        <nav className="border-dark-600 w-64 border-r px-5 py-5">
          <button className="flex items-center">
            <Image
              src={session?.user.image}
              className="h-8 w-8 rounded-full bg-gray-50"
              width={30}
              height={30}
              alt=""
            />
            <p className="text-dark-1000 ml-2 text-sm">{session?.user.name}</p>
          </button>

          <div>
            <ul role="list" className="-mx-2 my-6 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavButton
                    href={item.href}
                    current={item.current}
                    name={item.name}
                  />
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="w-full p-8">{props.children}</div>
      </div>
    </main>
  );
}
