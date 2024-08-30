import { useModal } from "~/providers/modal";
import Modal from "~/components/modal";
import Button from "~/components/Button";
import { DeleteWorkspaceConfirmation } from "./components/DeleteWorkspaceConfirmation";

export default function SettingsPage() {
  const { modalContentType, openModal } = useModal();

  return (
    <div className="px-28 py-12">
      <div className="mb-8 flex w-full justify-between">
        <h1 className="font-medium tracking-tight text-neutral-900 dark:text-dark-1000 sm:text-[1.2rem]">
          Settings
        </h1>
      </div>

      <div className="border-t border-light-300 dark:border-dark-300">
        <h2 className="mt-8 text-[14px] text-neutral-900 dark:text-dark-1000">
          Delete workspace
        </h2>
        <p className="mb-8 mt-2 text-sm text-neutral-500 dark:text-dark-900">
          Once you delete your workspace, there is no going back. Please be
          certain.
        </p>
        <Button variant="primary" onClick={() => openModal("DELETE_WORKSPACE")}>
          Delete workspace
        </Button>
      </div>

      <Modal>
        {modalContentType === "DELETE_WORKSPACE" && (
          <DeleteWorkspaceConfirmation />
        )}
      </Modal>
    </div>
  );
}
