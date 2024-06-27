"use client";
import IconPlusCircle from "@/components/icon/icon-plus-circle";
import IconX from "@/components/icon/icon-x";
import { Dialog, Transition, TransitionChild, DialogPanel } from "@headlessui/react";
import { Fragment, useState, useTransition, useEffect } from "react";
import IconLoader from "../icon/icon-loader";
import { State } from "@/lib/actions";
import Swal from "sweetalert2";

interface Props {
  children: React.ReactNode;
  title: string;
  // eslint-disable-next-line no-unused-vars
  action: (data: any) => void;
  state: State;
  onSuccess: () => void;
  isValid?: boolean;
  // eslint-disable-next-line no-unused-vars
  setError: any;
}

export default function FormModal({ children, title, action, state, onSuccess, isValid, setError }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [pending, startTransaction] = useTransition();

  useEffect(() => {
    if (!state) return;
    Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 3000,
    }).fire({
      title: state.message,
      icon: state.status === "error" ? "error" : "success",
    });
    if (state.status === "error") {
      state.errors?.forEach((error) => {
        setError(error.path, {
          message: error.message,
        });
      });
    } else {
      // revalidate path
      onSuccess();
      // close the dialog after 300 milliseconds
      setTimeout(() => {
        setShowModal(false);
      }, 300);
    }
    // close the dialog after 300 milliseconds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex flex-row-reverse">
      <button type="button" className="h-8 btn btn-primary" onClick={() => setShowModal(true)}>
        <IconPlusCircle className="ltr:mr-2 rtl:ml-2" />
        {title}
      </button>
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[black]/60" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="panel w-full max-w-lg overflow-visible rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <button
                    type="button"
                    title="add"
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                  >
                    <IconX />
                  </button>
                  <div className="rounded bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                    {title}
                  </div>
                  <div className="p-5">
                    <form action={(formData: any) => startTransaction(() => action(formData))}>
                      {children}
                      <div className=" flex items-center justify-end">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setShowModal(false)}>
                          Cancel
                        </button>
                        <button
                          title="submit"
                          type="submit"
                          className="btn btn-primary ltr:ml-4 rtl:mr-4"
                          disabled={!isValid}
                        >
                          {pending && <IconLoader className="animate-spin h-5 w-5 mr-3" />}
                          {pending ? "Adding..." : "Add"}
                        </button>
                      </div>
                    </form>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
