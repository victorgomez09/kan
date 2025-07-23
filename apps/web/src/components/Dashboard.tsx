import { authClient } from "@kan/auth/client";
import SideNavigation from "./SideNavigation";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

interface DashboardProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  hasRightPanel?: boolean;
}

export default function Dashboard({
  children,
  hasRightPanel,
  rightPanel
}: DashboardProps) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  return (
    <div className="flex">
      <SidebarProvider>
        <SideNavigation
          user={{ email: session?.user.email, image: session?.user.image }}
          isLoading={sessionLoading}
        />

        <main className="flex-grow p-2 w-full h-full max-w-[calc(100%-16em)] overflow-none">
          <SidebarTrigger />

          {children}
        </main>

        {hasRightPanel && rightPanel}
      </SidebarProvider>
    </div>
  );
}
