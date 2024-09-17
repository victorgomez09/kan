import { WorkspaceProvider } from "~/providers/workspace";
import Dashboard from "~/components/dashboard";
import SettingsView from "~/views/settings";
import Popup from "~/components/Popup";

export default function SettingsPage() {
  return (
    <WorkspaceProvider>
      <Dashboard>
        <SettingsView />
      </Dashboard>
      <Popup />
    </WorkspaceProvider>
  );
}
