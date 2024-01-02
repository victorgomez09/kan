import Link from "next/link";

import { api } from "~/trpc/react";

export function BoardsList() {
  const { data } = api.board.all.useQuery();

  if (data?.length === 0) return <></>;

  return (
    <>
      {data?.map((board) => {
        return (
          <Link key={board.publicId} href={`boards/${board.publicId}`}>
            <div className="align-center mr-5 flex w-72 justify-center rounded-md border border-dashed border-dark-600 bg-dark-100 p-14 hover:bg-dark-200">
              <p className="text-md px-4 font-medium text-dark-1000">
                {board.name}
              </p>
            </div>
          </Link>
        );
      })}
    </>
  );
}
