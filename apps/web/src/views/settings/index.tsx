import { HiMiniArrowTopRightOnSquare } from "react-icons/hi2";

import Button from "~/components/Button";
import Modal from "~/components/modal";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { PageHead } from "~/components/PageHead";
import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import { DeleteWorkspaceConfirmation } from "./components/DeleteWorkspaceConfirmation";
import { PremiumUsernameConfirmation } from "./components/PremiumUsernameConfirmation";
import UpdateWorkspaceNameForm from "./components/UpdateWorkspaceNameForm";
import UpdateWorkspaceUrlForm from "./components/UpdateWorkspaceUrlForm";

export default function SettingsPage() {
  const { modalContentType, openModal } = useModal();
  const { workspace } = useWorkspace();

  const handleOpenBillingPortal = async () => {
    try {
      const response = await fetch("/api/stripe/create_billing_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { url } = (await response.json()) as { url: string };

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating billing session:", error);
    }
  };

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="h-full max-h-[calc(100vh-4rem)] overflow-y-auto">
          <PageHead title={`Settings | ${workspace.name ?? "Workspace"}`} />
          <div className="px-28 py-12">
            <div className="mb-8 flex w-full justify-between">
              <h1 className="font-medium tracking-tight text-neutral-900 dark:text-dark-1000 sm:text-[1.2rem]">
                Settings
              </h1>
            </div>

            <div className="mb-8 border-t border-light-300 dark:border-dark-300">
              <h2 className="mb-4 mt-8 text-[14px] text-neutral-900 dark:text-dark-1000">
                Workspace name
              </h2>
              <UpdateWorkspaceNameForm
                workspacePublicId={workspace.publicId}
                workspaceName={workspace.name}
              />

              <h2 className="mb-4 mt-8 text-[14px] text-neutral-900 dark:text-dark-1000">
                Workspace username
              </h2>
              <UpdateWorkspaceUrlForm
                workspacePublicId={workspace.publicId}
                workspaceUrl={workspace.slug}
                workspacePlan={workspace.plan}
              />
            </div>

            <div className="mb-8 border-t border-light-300 dark:border-dark-300">
              <h2 className="mb-4 mt-8 text-[14px] text-neutral-900 dark:text-dark-1000">
                Billing
              </h2>
              <p className="mb-8 text-sm text-neutral-500 dark:text-dark-900">
                View and manage your billing and subscription.
              </p>
              <Button
                variant="primary"
                iconRight={<HiMiniArrowTopRightOnSquare />}
                onClick={handleOpenBillingPortal}
              >
                Billing portal
              </Button>
            </div>

            <div className="border-t border-light-300 dark:border-dark-300">
              <h2 className="mt-8 text-[14px] text-neutral-900 dark:text-dark-1000">
                Delete workspace
              </h2>
              <p className="mb-8 mt-2 text-sm text-neutral-500 dark:text-dark-900">
                Once you delete your workspace, there is no going back. Please
                be certain.
              </p>
              <Button
                variant="primary"
                onClick={() => openModal("DELETE_WORKSPACE")}
              >
                Delete workspace
              </Button>
            </div>
          </div>

          <Modal>
            {modalContentType === "NEW_WORKSPACE" && <NewWorkspaceForm />}
            {modalContentType === "DELETE_WORKSPACE" && (
              <DeleteWorkspaceConfirmation />
            )}
            {modalContentType === "PREMIUM_USERNAME" && (
              <PremiumUsernameConfirmation
                workspacePublicId={workspace.publicId}
              />
            )}
          </Modal>
        </div>
      </div>
    </>
  );
}
