import { t } from "@lingui/core/macro";
import { HiArrowDownTray, HiOutlinePlusSmall } from "react-icons/hi2";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { PageHead } from "~/components/PageHead";
import { useWorkspace } from "~/providers/workspace";
import { BoardsList } from "./components/BoardsList";
import { ImportBoardsForm } from "./components/ImportBoardsForm";
import { NewBoardForm } from "./components/NewBoardForm";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

export default function BoardsPage() {
  const { workspace, hasLoaded } = useWorkspace();

  return (
    <>
      {hasLoaded && !workspace.publicId ? (
        <Dialog defaultOpen={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t`New workspace`}</DialogTitle>
            </DialogHeader>

            <NewWorkspaceForm />
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <PageHead title={t`Boards | ${workspace.name ?? "Workspace"}`} />
          <div className="m-auto max-w-[1600px] px-5 py-6 md:px-8 md:py-8">
            <div className="mb-8 flex w-full items-center justify-between">
              <h1 className="font-bold tracking-tight sm:text-[1.2rem]">
                {t`Boards`}
              </h1>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger>
                    <Button
                      type="button"
                      variant="secondary"
                    >
                      <HiArrowDownTray aria-hidden="true" className="h-4 w-4" />
                      {t`Import`}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t`New import`}</DialogTitle>
                    </DialogHeader>

                    <ImportBoardsForm />
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger>
                    <Button
                      type="button"
                    >
                      <HiOutlinePlusSmall aria-hidden="true" className="h-4 w-4" />
                      {t`New`}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t`New board`}</DialogTitle>
                    </DialogHeader>

                    <NewBoardForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex h-full flex-row">
              <BoardsList />
            </div>
          </div>
        </>
      )}
    </>
  );
}
