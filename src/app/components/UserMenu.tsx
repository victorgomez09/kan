"use client";

import { Fragment } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Menu, Transition } from "@headlessui/react";
import { HiOutlineLogout } from "react-icons/hi";

interface UserMenuProps {
  imageUrl: string | undefined;
  email: string;
}

export default function UserMenu({ imageUrl, email }: UserMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="-mx-2 flex items-center rounded-md p-1.5 text-dark-900 hover:bg-dark-200 hover:text-dark-1000">
          {imageUrl ? (
            <Image
              src={imageUrl ?? ""}
              className="h-8 w-8 rounded-full bg-gray-50"
              width={30}
              height={30}
              alt=""
            />
          ) : (
            <span className="inline-block h-6 w-6 overflow-hidden rounded-full bg-dark-400">
              <svg
                className="h-full w-full text-dark-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          )}
          <span className="ml-2 truncate text-sm">{email}</span>
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
        <Menu.Items className="absolute bottom-[50px] right-[-10px] z-10 mt-2 w-[225px] origin-bottom-right rounded-md border border-dark-400 bg-dark-300 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="flex">
            <Menu.Item>
              {() => (
                <button
                  onClick={() => signOut({ callbackUrl: "/boards" })}
                  className="m-1 flex w-full items-center rounded-[5px] px-3 py-2 text-left text-sm text-dark-1000 hover:bg-dark-400"
                >
                  <HiOutlineLogout size={18} className="mr-2" />
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
