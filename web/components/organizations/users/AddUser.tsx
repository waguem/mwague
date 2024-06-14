import { Transition, Dialog, DialogPanel, TransitionChild } from "@headlessui/react";
import { Fragment, useEffect, useTransition } from "react";
import IconX from "../../icon/icon-x";
import { useState } from "react";
import { UserRoleSelector } from "@/components/layouts/slider/RoleUpdater";
import { FieldPath, useForm } from "react-hook-form";
import IconUserPlus from "@/components/icon/icon-user-plus";
import { getTranslation } from "@/i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddUserSchema } from "@/lib/schemas/actions";
import { ErrorMessage } from "@hookform/error-message";
import clsx from "clsx";
import IconPlus from "@/components/icon/icon-plus";
import { addEmployee } from "@/lib/actions/employee";
import { State } from "@/lib/actions";
import { useFormState } from "react-dom";
import Swal from "sweetalert2";
import IconLoader from "@/components/icon/icon-loader";

type UserInputs = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  office_id: string;
  org_id: string;
  roles: string[];
};

export function AddUser({ officeId }: { officeId: string }) {
  const [addUser, setAddUser] = useState(false);
  const {
    register,
    control,
    setError,
    reset,
    formState: { errors, isValid, touchedFields },
  } = useForm<UserInputs>({
    mode: "all",
    resolver: zodResolver(AddUserSchema),
  });
  const [pending, startTransaction] = useTransition();
  const [state, formAction] = useFormState<State, FormData>(addEmployee, null);
  const { t } = getTranslation();
  /**
   *  show sweet alert
   */
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
        setError(error.path as FieldPath<UserInputs>, {
          message: error.message,
        });
      });
    } else {
      reset();
      // close the dialog after 300 milliseconds
      setTimeout(() => {
        setAddUser(false);
      }, 300);
    }
  }, [state, setError, reset]);

  const hidenInputs = (
    <div>
      <input type="hidden" {...register("office_id", { required: true })} value={officeId} />
    </div>
  );

  return (
    <div className="flex flex-row-reverse">
      <button type="button" title="Add User" className="btn btn-primary mb-2 h-8" onClick={() => setAddUser(true)}>
        <IconPlus className="w-4 h-4 inline-block mr-2" />
        Add User
      </button>

      <Transition appear show={addUser} as={Fragment}>
        <Dialog as="div" open={addUser} onClose={() => setAddUser(false)} className="relative z-50">
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
          <div className="fixed inset-0 overflow-y-visible">
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
                    title="Close"
                    onClick={() => setAddUser(false)}
                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                  >
                    <IconX />
                  </button>
                  <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                    <IconUserPlus className="w-6 h-6 inline-block" />
                    <span className="ltr:ml-2 rtl:mr-2">{t("add_user")}</span>
                  </div>
                  <div className="p-5">
                    <form action={(formData: any) => startTransaction(() => formAction(formData))}>
                      <div className="mb-5 flex justify-between gap-4">
                        <div
                          className={clsx("flex-1", {
                            "has-error": errors?.username && touchedFields?.username,
                            "has-success": !errors?.username && touchedFields?.username,
                          })}
                        >
                          <label htmlFor="username">{t("username")}</label>
                          <input
                            id="username"
                            {...register("username", { required: true })}
                            type="text"
                            placeholder="user login"
                            className="form-input"
                          />
                          <span
                            className={clsx("text-sm", {
                              "text-success": !errors?.username && touchedFields?.username,
                              "text-error": errors?.username && touchedFields?.username,
                            })}
                          >
                            <ErrorMessage errors={errors} name="username" />
                          </span>
                        </div>
                        <div
                          className={clsx({
                            "has-error": errors?.email && touchedFields?.email,
                            "has-success": !errors?.email && touchedFields?.email,
                          })}
                        >
                          <label htmlFor="email">{t("email")}</label>
                          <input
                            {...register("email", { required: true })}
                            className="form-input"
                            id="email"
                            type="text"
                            placeholder="Valid Email"
                          />
                          <span className="text-sm">
                            <ErrorMessage errors={errors} name="email" />
                          </span>
                        </div>
                      </div>
                      <div className="mb-5 flex justify-between gap-4">
                        <div
                          className={clsx("flex-1", {
                            "has-error": errors?.password && touchedFields?.password,
                            "has-success": !errors?.password && touchedFields?.password,
                          })}
                        >
                          <label htmlFor="password">{t("password")}</label>
                          <input
                            id="password"
                            {...register("password", { required: true })}
                            type="password"
                            placeholder="Default password"
                            className="form-input"
                          />
                          <span className="text-sm">
                            <ErrorMessage errors={errors} name="password" />
                          </span>
                        </div>
                        <div
                          className={clsx("flex-1", {
                            "has-error": errors?.confirmPassword && touchedFields?.confirmPassword,
                            "has-success": !errors?.confirmPassword && touchedFields?.confirmPassword,
                          })}
                        >
                          <label htmlFor="confirmPassword">{t("password_confirmation")}</label>
                          <input
                            id="confirmpassword"
                            {...register("confirmPassword", { required: true })}
                            type="password"
                            placeholder="Password Confirmation"
                            className="form-input"
                          />
                          <span className="text-sm">
                            <ErrorMessage errors={errors} name="confirmPassword" />
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 flex justify-between gap-4">
                        <div className="flex-1">
                          <label htmlFor="tag">{t("roles")}</label>
                          <UserRoleSelector
                            register={register}
                            control={control}
                            className={"has-success"}
                            roles={[]}
                          />
                        </div>
                      </div>
                      {hidenInputs}
                      <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                        <button
                          title="close"
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => {
                            reset();
                            setAddUser(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          title="submitButton"
                          type="submit"
                          disabled={!isValid}
                          className="btn btn-primary ltr:ml-4 rtl:mr-4"
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
