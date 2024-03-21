import { WorkspaceProvider } from "~/app/providers/workspace";
import Dashboard from "~/app/components/dashboard";

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <Dashboard>{props.children}</Dashboard>
    </WorkspaceProvider>
  );
}
