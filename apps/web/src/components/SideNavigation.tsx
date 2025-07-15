"use client"

import { t } from "@lingui/core/macro";
import { ChevronDown, ChevronsUpDown, GalleryVerticalEnd, Settings, SquareKanban, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { HiCheck } from "react-icons/hi";
import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Separator } from "./ui/separator";

interface SideNavigationProps {
  user: UserType;
  isLoading: boolean;
}

interface UserType {
  email?: string | null | undefined;
  image?: string | null | undefined;
}

export default function SideNavigation({
  user,
  isLoading,
}: SideNavigationProps) {
  const router = useRouter();
  const { workspace, isLoading: worspaceLoading, availableWorkspaces, switchWorkspace } =
    useWorkspace();
  const { openModal } = useModal();

  const { pathname } = router;

  const navigation = [
    {
      name: t`Boards`,
      href: "/boards",
      icon: SquareKanban,
    },
    {
      name: t`Members`,
      href: "/members",
      icon: Users,
    },
    {
      name: t`Settings`,
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="">{workspace.name}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width)"
                align="start"
              >
                {availableWorkspaces.map((availableWorkspace) => (
                  <DropdownMenuItem
                    key={availableWorkspace.name}
                    onSelect={() => switchWorkspace(availableWorkspace)}
                  >
                    {workspace.name === availableWorkspace.name && (
                      <span>
                        <HiCheck className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-[5px] bg-indigo-700">
                      <span className="text-xs font-medium leading-none text-white">
                        {availableWorkspace.name.charAt(0).toUpperCase()}
                      </span>
                    </span>
                    <span className="ml-2 text-xs font-medium">
                      {availableWorkspace.name}
                    </span>
                  </DropdownMenuItem>
                ))}

                <Separator className="my-2" />
                <DropdownMenuItem>
                  <span
                    onClick={() => openModal("NEW_WORKSPACE")}
                    className="cursor-pointer"
                  >
                    {t`Create workspace`}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    // <nav className="flex h-full w-64 flex-col justify-between border-r border-light-600 bg-light-50 px-3 pb-3 pt-5 dark:border-dark-400 dark:bg-dark-50">
    //   <div>
    //     <WorkspaceMenu />
    //     <ul role="list" className="space-y-1">
    //       {navigation.map((item) => (
    //         <li key={item.name}>
    //           <ReactiveButton
    //             href={item.href}
    //             current={pathname.includes(item.href)}
    //             name={item.name}
    //             json={item.icon}
    //           />
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    //   <UserMenu
    //     email={user.email ?? ""}
    //     imageUrl={user.image ?? undefined}
    //     isLoading={isLoading}
    //   />
    // </nav>
  );
}
