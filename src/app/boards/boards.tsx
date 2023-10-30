import Link from "next/link";

import { api } from "~/trpc/server";

export async function Boards() {
  const boards = await api.board.all.query();

  if (boards?.length === 0) return <></>;

  return (
    <div>
      {boards?.map((board) => {
        return (
          <Link key={board.id} href={`boards/${board.id}`}>
            <div className="align-center mr-5 flex w-72 justify-center rounded-md border border-dashed border-dark-600 bg-dark-100 p-14 hover:bg-dark-200">
              <p className="text-md px-4 font-medium text-dark-1000">
                {board.name}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
