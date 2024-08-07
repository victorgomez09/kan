import { useEffect } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import { HiXMark } from "react-icons/hi2";
import { Transition } from "@headlessui/react";

import { usePopup } from "~/providers/popup";

const Popup: React.FC = () => {
  const { isOpen, popupHeader, popupMessage, hidePopup } = usePopup();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hidePopup();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, hidePopup]);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-10 flex items-end px-4 py-6 sm:items-end sm:p-6"
    >
      <Transition
        show={isOpen}
        className="flex w-full flex-col items-center space-y-4 sm:items-end"
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enterTo="opacity-100 translate-y-0 sm:scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border border-light-400 bg-light-50 shadow-lg ring-1 ring-black ring-opacity-5 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in dark:border-dark-300 dark:bg-dark-200 data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <HiOutlineExclamationCircle
                  aria-hidden="true"
                  className="h-6 w-6 text-red-400"
                />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-neutral-900 dark:text-dark-1000">
                  {popupHeader}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-dark-900">
                  {popupMessage}
                </p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    hidePopup();
                  }}
                  className="dark:hover:bg-dark-4000 mx-1 inline-flex h-fit items-center rounded-md p-1 px-1 text-sm font-semibold text-dark-50 hover:bg-light-100"
                >
                  <span className="sr-only">Close</span>
                  <HiXMark
                    aria-hidden="true"
                    className="h-5 w-5 text-dark-900"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Popup;
