import { useRef, useState } from "react";
import { authClient } from "@kan/auth/client";
import { useClickOutside } from "~/hooks/useClickOutside";
import SideNavigation from "./SideNavigation";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

interface DashboardProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  hasRightPanel?: boolean;
}

export default function Dashboard({
  children,
}: DashboardProps) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const sideNavRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const sideNavButtonRef = useRef<HTMLButtonElement>(null);
  const rightPanelButtonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(sideNavRef, (event) => {
    if (sideNavButtonRef.current?.contains(event.target as Node)) {
      return;
    }
    if (isSideNavOpen) {
      setIsSideNavOpen(false);
    }
  });

  useClickOutside(rightPanelRef, (event) => {
    if (rightPanelButtonRef.current?.contains(event.target as Node)) {
      return;
    }
    if (isRightPanelOpen) {
      setIsRightPanelOpen(false);
    }
  });

  return (
    // <div className="flex h-screen flex-col items-center md:min-w-[800px]">
    <SidebarProvider>
      <SideNavigation
        user={{ email: session?.user.email, image: session?.user.image }}
        isLoading={sessionLoading}
      />

      <main className="p-2 w-full h-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
    // </div>
  );
}
