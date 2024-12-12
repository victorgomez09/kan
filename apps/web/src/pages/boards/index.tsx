import { WorkspaceProvider } from "~/providers/workspace";
import Dashboard from "~/components/Dashboard";
import Popup from "~/components/Popup";
import BoardsView from "~/views/boards";

export default function BoardsPage() {
  return (
    <WorkspaceProvider>
      <Dashboard>
        <BoardsView />
      </Dashboard>
      <Popup />
    </WorkspaceProvider>
  );
}
