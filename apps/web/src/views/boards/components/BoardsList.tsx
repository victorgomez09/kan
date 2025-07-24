import { t } from "@lingui/core/macro";
import Link from "next/link";
import { HiOutlineRectangleStack } from "react-icons/hi2";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import { NewBoardForm } from "./NewBoardForm";

export function BoardsList() {
  const { workspace } = useWorkspace();
  const { openModal } = useModal();

  const { data, isLoading } = api.board.all.useQuery(
    { workspacePublicId: workspace.publicId },
    { enabled: workspace.publicId ? true : false },
  );

  if (isLoading)
    return (
      <div className="xxl:grid-cols-7 grid w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
      </div>
    );

  if (data?.length === 0)
    return (
      <div className="z-10 flex h-full w-full flex-col items-center justify-center space-y-8 pb-[150px]">
        <div className="flex flex-col items-center">
          <HiOutlineRectangleStack className="h-10 w-10" />
          <p className="mb-2 mt-4 text-[14px] font-bold ">
            {t`No boards`}
          </p>
          <p className="text-[14px]">
            {t`Get started by creating a new board`}
          </p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>
              {t`Create new board`}
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
    );

  return (
    <div className="grid h-fit w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
      {data?.map((board) => (
        <Link key={board.publicId} href={`boards/${board.publicId}`}>
          <Card>
            <CardContent>
              <p className="text-md px-4 font-bold">
                {board.name}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
