"use client";

import { HiOutlinePlusSmall } from "react-icons/hi2";
import { useModal } from "~/app/providers/modal";
import { useWorkspace } from "~/app/providers/workspace";
import Modal from "~/app/components/modal";

import { ImportBoardsForm } from "~/app/boards/components/ImportBoardsForm";
import { NewBoardForm } from "~/app/boards/components/NewBoardForm";

import { api } from "~/trpc/react";

export default function MembersPage() {
  const { openModal, modalContentType } = useModal();
  const { workspace } = useWorkspace();

  const { data } = api.workspace.byId.useQuery(
    { publicId: workspace.publicId },
    { enabled: workspace?.publicId ? true : false },
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex w-full justify-between">
        <h1 className="font-medium tracking-tight text-dark-1000 sm:text-[1.2rem]">
          Members
        </h1>
        <div className="flex">
          <button
            type="button"
            className="flex items-center gap-x-1.5 rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => openModal("NEW_BOARD")}
          >
            <div className="h-5 w-5 items-center">
              <HiOutlinePlusSmall
                className="-mr-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </div>
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data?.members.map((member) => (
          <div
            key={member.publicId}
            className="relative flex items-center space-x-3 rounded-md border border-dashed border-dark-600 bg-dark-100 px-6 py-5 shadow-sm"
          >
            <div className="flex-shrink-0">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-dark-400">
                <span className="text-sm font-medium leading-none text-white">
                  {member.user.name
                    ?.split(" ")
                    .map((namePart) => namePart.charAt(0).toUpperCase())
                    .join("")}
                </span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div>
                <div className="mb-1 flex items-center">
                  <p className="mr-2 text-sm font-medium text-dark-1000">
                    {member.user.name}
                  </p>
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>
                <span className="absolute inset-0" aria-hidden="true" />

                <p className="truncate text-sm text-dark-900">
                  {member.user.email}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal>
        {modalContentType === "NEW_BOARD" && <NewBoardForm />}
        {modalContentType === "IMPORT_BOARDS" && <ImportBoardsForm />}
      </Modal>
    </div>
  );
}
