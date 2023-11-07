"use client";

import { api } from "~/trpc/react";

export default function BoardPage({ params }: { params: { id: string[] } }) {
  const boardId = params.id[0];

  if (!boardId) return <></>;

  const { data } = api.board.byId.useQuery({ id: boardId });

  console.log({ data });

  return <></>;
}
