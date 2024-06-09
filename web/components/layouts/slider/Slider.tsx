"use client";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import IconPencil from "@/components/icon/icon-pencil";
import { EmployeeResponse } from "@/lib/client";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import IconX from "@/components/icon/icon-x";
import { getTranslation } from "@/i18n";
import { UserRoleSelector } from "./RoleUpdater";
import clsx from "clsx";
import { useFormState } from "react-dom";
import { updateEmployee } from "@/lib/actions/employee";
import { State } from "@/lib/actions/state";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserSchema } from "@/lib/schemas/actions";
import { useEffect } from "react";
import Swal from "sweetalert2";

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
  const { t } = getTranslation();
  const [state, formAction] = useFormState<State, FormData>(updateEmployee, null);
  const {
    register,
    setError,
    reset,
    control,
    formState: { isValid },
  } = useForm<EmployeeResponse>({
    mode: "all",
    resolver: zodResolver(UpdateUserSchema),
  });

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
    if (state.status == "error") {
      state.errors?.forEach((error) => {
        setError(error.path as keyof EmployeeResponse, { message: error.message });
      });
    } else {
      reset();
    }
  }, [state, setError, reset]);

  if (!user) {
    onClose();
    return null;
  }

  const hidenInpust = (
    <div>
      <input
        id="org_id"
        type="hidden"
        {...register("organization_id", { value: user.organization_id })}
        value={user.organization_id}
      />
      <input
        id="office_id"
        type="hidden"
        {...register("office_id", { value: user.office_id })}
        value={user.office_id}
      />
      <input id="id" type="hidden" {...register("id", { value: user.id })} value={user.id} />
    </div>
  );

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
                  <div
                    className={clsx("md:h-full md:relative overflow-y-auto p-8", {
                      "bg-white": !isDarkMode,
                      "bg-gray-800 text-gray-500": isDarkMode,
                    })}
                  >
                    <form action={formAction}>
                      {hidenInpust}
                      <div>
                        <h3
                          className={clsx("font-medium", {
                            "text-gray-900": !isDarkMode,
                          })}
                        >
                          {t("information")}
                        </h3>
                        <div
                          className={clsx("mt-2 divide-y border-b border-t", {
                            "divide-gray-500 border-gray-500": isDarkMode,
                            "divide-gray-200 border-gray-200": !isDarkMode,
                          })}
                        >
                          <div className="flex justify-between py-1 text-sm font-medium">
                            <label htmlFor="username" className="text-gray-500">
                              {t("username")}
                            </label>
                            <input
                              id="username"
                              type="text"
                              className={clsx("bg-inherit text-right", {
                                "text-gray-900": !isDarkMode,
                                "text-gray-500": isDarkMode,
                              })}
                              {...register("username", { value: user.username })}
                              value={user.username}
                            />
                          </div>
                          <div className="flex justify-between py-1 text-sm font-medium">
                            <label htmlFor="email" className="text-gray-500">
                              {t("email")}
                            </label>
                            <input
                              id="email"
                              type="email"
                              className={clsx("bg-inherit text-right", {
                                "text-gray-900": !isDarkMode,
                                "text-gray-500": isDarkMode,
                              })}
                              {...register("email", { value: user.email })}
                              value={user.email}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 pb-16">
                        <div className="flex py-1 text-sm font-medium">
                          <span className="text-gray-500 mt-1">Roles</span>
                        </div>
                        <UserRoleSelector
                          register={register}
                          control={control}
                          className={clsx("w-full mt-0", {
                            "text-gray-900 bg-black": isDarkMode,
                          })}
                          roles={user.roles}
                        />
                        <div>
                          <h3
                            className={clsx("font-medium", {
                              "text-gray-900": !isDarkMode,
                            })}
                          >
                            Description
                          </h3>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm italic text-gray-500">Add a description to this image.</p>
                            <button
                              type="button"
                              className="relative -mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <span className="absolute -inset-1.5" />
                              <IconPencil />
                              <span className="sr-only">Add description</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex">
                          <button
                            type="submit"
                            disabled={!isValid}
                            className=" btn flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
