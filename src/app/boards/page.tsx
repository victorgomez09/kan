"use client";

import { HiOutlinePlusSmall } from "react-icons/hi2";
import { Boards } from "./boards";

import { useModal } from "~/app/providers/modal";
import Modal from "~/app/_components/modal";

import { NewBoardForm } from "~/app/boards/create";

export default function BoardsPage() {
  const { openModal } = useModal();

  return (
    <div className="p-8">
      <div className="mb-8 flex w-full justify-between">
        <h1 className="font-medium tracking-tight text-dark-1000 sm:text-[1.2rem]">
          Boards
        </h1>
        <div>
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-dark-1000 px-3 py-2 text-sm font-semibold text-dark-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => openModal("NEW_BOARD")}
          >
            <HiOutlinePlusSmall
              className="-mr-0.5 h-5 w-5"
              aria-hidden="true"
            />
            New
          </button>
        </div>
      </div>

      <Modal>
        <NewBoardForm />
      </Modal>

      <div className="flex flex-row">
        <Boards />
      </div>
    </div>
  );
}
