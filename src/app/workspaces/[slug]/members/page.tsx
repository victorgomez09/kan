"use client";

import { HiOutlinePlusSmall } from "react-icons/hi2";
import { useModal } from "~/app/providers/modal";
import Modal from "~/app/components/modal";

import { ImportBoardsForm } from "~/app/boards/components/ImportBoardsForm";
import { NewBoardForm } from "~/app/boards/components/NewBoardForm";

export default function MembersPage() {
  const { openModal, modalContentType } = useModal();

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

      <Modal>
        {modalContentType === "NEW_BOARD" && <NewBoardForm />}
        {modalContentType === "IMPORT_BOARDS" && <ImportBoardsForm />}
      </Modal>
    </div>
  );
}
