"use client";

import { usePathname } from "next/navigation";

import { useTheme } from "~/app/providers/theme";

import boardsIconDark from "~/app/assets/boards-dark.json";
import boardsIconLight from "~/app/assets/boards-light.json";
import membersIconDark from "~/app/assets/members-dark.json";
import membersIconLight from "~/app/assets/members-light.json";
import settingsIconDark from "~/app/assets/settings-dark.json";
import settingsIconLight from "~/app/assets/settings-light.json";

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
  const { theme } = useTheme();

  const navigation = [
    {
      name: "Boards",
      href: "/boards",
      icon: theme === "dark" ? boardsIconDark : boardsIconLight,
    },
    {
      name: "Members",
      href: "/members",
      icon: theme === "dark" ? membersIconDark : membersIconLight,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: theme === "dark" ? settingsIconDark : settingsIconLight,
    },
  ];

  return (
    <>
      <nav className="border-light-600 flex w-72 flex-col justify-between border-r px-3 pb-3 pt-5 dark:border-dark-600">
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
