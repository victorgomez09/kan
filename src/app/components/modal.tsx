"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

import { useModal } from "~/app/providers/modal";

interface Props {
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ children }) => {
  const { isOpen, closeModal } = useModal();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-light-50 fixed inset-0 bg-opacity-40 transition-opacity dark:bg-dark-50 dark:bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center sm:items-start sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="shadow-3xl-light dark:shadow-3xl-dark bg-light-50 border-light-600 relative mt-[25vh] transform rounded-lg border px-4 pb-4 pt-5 text-left transition-all dark:border-dark-600 dark:bg-dark-100/20 dark:backdrop-blur-lg sm:mb-8 sm:w-full sm:max-w-sm sm:p-6">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
