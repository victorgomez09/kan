"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useModal } from "~/app/providers/modal";

export default function Dropdown() {
  const { openModal } = useModal();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex h-8 w-8 items-center justify-center rounded-[5px] hover:bg-dark-200">
          <HiEllipsisHorizontal size={25} className="text-dark-900" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-dark-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="flex">
            <Menu.Item>
              {() => (
                <button
                  onClick={() => openModal("DELETE_CARD")}
                  className="m-1 w-full rounded-[5px] px-3 py-2 text-left text-sm text-dark-1000 hover:bg-dark-400"
                >
                  Delete
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
