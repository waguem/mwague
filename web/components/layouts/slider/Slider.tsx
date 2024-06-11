"use client";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { EmployeeResponse } from "@/lib/client";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import IconX from "@/components/icon/icon-x";
import clsx from "clsx";
import UserUpdateForm from "./UserUpdateForm";

export default function Slider({
  user,
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  user?: EmployeeResponse;
  onClose: () => void;
}) {
  const isDarkMode = useSelector((state: IRootState) => state.themeConfig).isDarkMode;
  if (!user) {
    onClose();
    return null;
  }

  return (
    <Transition show={isOpen}>
      <Dialog className="relative z-1000" onClose={onClose}>
        <TransitionChild
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden z-40">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto relative w-96">
                  <TransitionChild
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className={clsx("relative rounded-md focus:outline-none focus:ring-2", {
                          "text-gray-300 hover:text-danger focus:ring-white": !isDarkMode,
                          "text-gray-700 hover:text-white focus:ring-gray-900": isDarkMode,
                        })}
                        onClick={() => onClose()}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <IconX className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </TransitionChild>
                  <UserUpdateForm user={user} />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
