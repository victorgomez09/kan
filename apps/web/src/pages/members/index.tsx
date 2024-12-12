import { WorkspaceProvider } from "~/providers/workspace";
import Dashboard from "~/components/Dashboard";
import Popup from "~/components/Popup";
import MembersView from "~/views/members";

export default function MembersPage() {
  return (
    <WorkspaceProvider>
      <Dashboard>
        <MembersView />
      </Dashboard>
      <Popup />
    </WorkspaceProvider>
  );
}
