"use client";
import IconUserPlus from "@/components/icon/icon-user-plus";
import IconX from "@/components/icon/icon-x";
import { getTranslation } from "@/i18n";
import { Transition, TransitionChild, DialogPanel, Dialog } from "@headlessui/react";
import React, { Fragment, useEffect, useState, useTransition } from "react";
import clsx from "clsx";
import { useFormState } from "react-dom";
import { Controller, useForm, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAgent, State } from "@/lib/actions";
import { AddAgentSchema } from "@/lib/schemas/actions";
import { ErrorMessage } from "@hookform/error-message";
import ReactSelect from "react-select";
import { agentTypeOptions, countryOptions } from "@/lib/utils/index";
import IconLoader from "@/components/icon/icon-loader";
import Swal from "sweetalert2";

type Inputs = {
  name: string;
  email: string;
  phone: string;
  country: string;
  initials: string;
  type: string;
};

export default function AddAgent() {
  const {
    register,
    setError,
    reset,
    control,
    formState: { isValid, errors, touchedFields },
  } = useForm<Inputs>({
    mode: "all",
    resolver: zodResolver(AddAgentSchema),
  });

  const [pending, startTransaction] = useTransition();

  const [state, formAction] = useFormState<State, FormData>(addAgent, null);
  const [addContactModal, setAddContactModal] = useState(false);
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
        setError(error.path as FieldPath<Inputs>, {
          message: error.message,
        });
      });
    } else {
      // revalidate path

      reset();
      // close the dialog after 300 milliseconds
      setTimeout(() => {
        setAddContactModal(false);
      }, 300);
    }
  }, [state, setError, reset]);
  const { t } = getTranslation();
  console.log(errors);
  return (
    <div>
      <button type="button" className="btn btn-primary" onClick={() => setAddContactModal(true)}>
        <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
        {t("add_agent")}
      </button>
      <Transition appear show={addContactModal} as={Fragment}>
        <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-50">
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
                    onClick={() => setAddContactModal(false)}
                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                  >
                    <IconX />
                  </button>
                  <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                    {t("add_agent")}
                  </div>
                  <div className="p-5">
                    <form action={(formData: any) => startTransaction(() => formAction(formData))}>
                      <div className="flex justify-between gap-3">
                        <div
                          className={clsx("mb-5 flex-1", {
                            "has-error": errors?.name && touchedFields?.name,
                            "has-success": !errors?.name && touchedFields?.name,
                          })}
                        >
                          <label htmlFor="name">{t("name")}</label>
                          <input
                            id="name"
                            type="text"
                            placeholder="Enter Name"
                            className="form-input"
                            {...register("name", { required: true, maxLength: 20 })}
                          />
                          <ErrorMessage errors={errors} name="name" />
                        </div>
                        <div className="mb-5 flext-1">
                          <label htmlFor="email">{t("initials")}</label>
                          <input
                            id="initials"
                            type="text"
                            placeholder="Enter Agent Initial"
                            className="form-input"
                            {...register("initials", { required: true })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between gap-3">
                        <div
                          className={clsx("mb-5 flex-1", {
                            "has-error": errors?.email && touchedFields?.email,
                            "has-success": !errors?.email && touchedFields?.email,
                          })}
                        >
                          <label htmlFor="email">{t("email")}</label>
                          <input
                            id="email"
                            type="email"
                            placeholder="Enter Email"
                            className="form-input"
                            {...register("email", { required: false })}
                          />
                          <ErrorMessage errors={errors} name="email" />
                        </div>
                        <div
                          className={clsx("mb-5 flext-1", {
                            "has-error": errors?.phone && touchedFields?.phone,
                            "has-success": !errors?.phone && touchedFields?.phone,
                          })}
                        >
                          <label htmlFor="phone">{t("phone")}</label>
                          <input
                            id="phone"
                            type="text"
                            placeholder="Phone Number"
                            className="form-input"
                            {...register("phone", { required: false })}
                          />
                          <ErrorMessage errors={errors} name="phone" />
                        </div>
                      </div>
                      <div className="flex justify-between gap-3">
                        <div className="flex-1">
                          <label htmlFor="country">{t("country")}</label>
                          <Controller
                            name="country"
                            control={control}
                            render={({ field: { onChange, onBlur } }) => (
                              <ReactSelect
                                id="country"
                                placeholder="Select a option"
                                options={countryOptions}
                                {...register("country")}
                                onChange={(option) => {
                                  onChange(option!.value);
                                }}
                                onBlur={onBlur}
                                className={clsx({
                                  "has-error": errors?.country,
                                  "has-success": !errors?.country,
                                  dark: true,
                                })}
                              />
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="type">{t("agent_type")}</label>
                          <Controller
                            name="type"
                            control={control}
                            render={({ field: { onChange, onBlur } }) => (
                              <ReactSelect
                                id="type"
                                placeholder="Select a option"
                                options={agentTypeOptions}
                                {...register("type")}
                                onChange={(option) => {
                                  onChange(option!.value);
                                }}
                                onBlur={onBlur}
                                className={clsx({
                                  "has-error": errors?.type,
                                  "has-success": !errors?.type,
                                })}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className="mt-8 flex items-center justify-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => setAddContactModal(false)}
                        >
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
