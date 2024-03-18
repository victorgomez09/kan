"use client";

import { usePathname } from "next/navigation";

import boardsIcon from "~/app/assets/boards.json";
import membersIcon from "~/app/assets/members.json";
import settingsIcon from "~/app/assets/settings.json";

import ReactiveButton from "~/app/components/ReactiveButton";
import UserMenu from "~/app/components/UserMenu";
import WorkspaceMenu from "~/app/components/WorkspaceMenu";

interface SideNavigationProps {
  user: UserType;
}

interface UserType {
  email?: string | null | undefined;
  image?: string | null | undefined;
}

export default function SideNavigation({ user }: SideNavigationProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Boards", href: "/boards", icon: boardsIcon },
    {
      name: "Members",
      href: "/members",
      icon: membersIcon,
    },
    { name: "Settings", href: "/settings", icon: settingsIcon },
  ];

  return (
    <>
      <nav className="flex w-72 flex-col justify-between border-r border-dark-600 px-3 pb-3 pt-5">
        <div>
          <WorkspaceMenu />
          <ul role="list" className="space-y-1">
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
        <UserMenu
          email={user?.email ?? ""}
          imageUrl={user?.image ?? undefined}
        />
      </nav>
    </>
  );
}
