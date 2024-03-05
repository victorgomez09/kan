"use client";

import Link from "next/link";

import { api } from "~/trpc/react";
import { useWorkspace } from "~/app/providers/workspace";

export function BoardsList() {
  const { workspace } = useWorkspace();

  const { data } = api.board.all.useQuery(
    { workspacePublicId: workspace?.publicId },
    { enabled: workspace?.publicId ? true : false },
  );

  if (data?.length === 0) return <></>;

  return (
    <div className="xxl:grid-cols-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data?.map((board) => (
        <Link key={board.publicId} href={`boards/${board.publicId}`}>
          <div className="align-center mr-5 flex h-[150px] w-full items-center justify-center rounded-md border border-dashed border-dark-600 bg-dark-100 hover:bg-dark-200">
            <p className="text-md px-4 font-medium text-dark-1000">
              {board.name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
