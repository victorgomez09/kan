"use client";

import { usePathname } from "next/navigation";

import { api } from "~/trpc/react";

import boardsIcon from "~/app/assets/boards.json";
import membersIcon from "~/app/assets/members.json";
import settingsIcon from "~/app/assets/settings.json";

import ReactiveButton from "~/app/components/ReactiveButton";
import UserMenu from "~/app/components/UserMenu";

const navigation = [
  { name: "Boards", href: "/boards", icon: boardsIcon },
  { name: "Members", href: "/members", icon: membersIcon },
  { name: "Settings", href: "/settings", icon: settingsIcon },
];

interface SideNavigationProps {
  user: UserType;
}

interface UserType {
  email?: string | null | undefined;
  image?: string | null | undefined;
}

export default function SideNavigation({ user }: SideNavigationProps) {
  const pathname = usePathname();

  const { data } = api.workspace.all.useQuery();

  const workspace = data?.[0];

  return (
    <nav className="flex w-72 flex-col justify-between border-r border-dark-600 px-5 py-5">
      <div>
        <div className="-mx-2 mb-4 flex items-center rounded-[5px] p-1.5 hover:bg-dark-200">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-[5px] bg-dark-400">
            <span className="text-xs font-medium leading-none text-white">
              {workspace?.name.charAt(0).toUpperCase()}
            </span>
          </span>
          <span className="ml-2 text-sm font-medium text-dark-1000">
            {workspace?.name}
          </span>
        </div>
        <ul role="list" className="-mx-2 my-3 space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <ReactiveButton
                href={item.href}
                current={pathname.includes(item.href)}
                name={item.name}
                json={item.icon}
              />
            </li>
          ))}
        </ul>
      </div>
      <UserMenu email={user?.email ?? ""} imageUrl={user?.image ?? undefined} />
    </nav>
  );
}
