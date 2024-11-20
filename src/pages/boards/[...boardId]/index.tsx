import { WorkspaceProvider } from "~/providers/workspace";
import Dashboard from "~/components/Dashboard";
import Popup from "~/components/Popup";
import BoardView from "~/views/board";

export default function BoardPage() {
  return (
    <WorkspaceProvider>
      <Dashboard>
        <BoardView />
      </Dashboard>
      <Popup />
    </WorkspaceProvider>
  );
}
