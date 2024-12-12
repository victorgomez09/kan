import Link from "next/link";

import { api } from "~/utils/api";
import { useWorkspace } from "~/providers/workspace";
import PatternedBackground from "~/components/PatternedBackground";

export function BoardsList() {
  const { workspace } = useWorkspace();

  const { data, isLoading } = api.board.all.useQuery(
    { workspacePublicId: workspace?.publicId },
    { enabled: workspace?.publicId ? true : false },
  );

  if (isLoading)
    return (
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5">
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
      </div>
    );

  if (data?.length === 0) return <></>;

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5">
      {data?.map((board) => (
        <Link key={board.publicId} href={`boards/${board.publicId}`}>
          <div className="align-center relative mr-5 flex h-[150px] w-full items-center justify-center rounded-md border border-dashed border-light-400 bg-light-50 shadow-sm hover:bg-light-200 dark:border-dark-600 dark:bg-dark-50 dark:hover:bg-dark-100">
            <PatternedBackground />
            <p className="text-md px-4 font-medium text-neutral-900 dark:text-dark-1000">
              {board.name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
