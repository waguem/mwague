"use client";
import IconChecks from "@/components/icon/icon-checks";
import IconXCircle from "@/components/icon/icon-x-circle";
import { TransactionResponse } from "@/lib/client";
import { Textarea, Transition } from "@headlessui/react";
import Image from "next/image";
import TransactionInfo from "./TransactionInfo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionReviewResolver } from "@/lib/schemas/actions";
import { useCallback, useTransition } from "react";
import { useFormState } from "react-dom";
import { State } from "@/lib/actions";
import { reviewTransaction } from "@/lib/actions/transactions";
import useResponse from "@/app/hooks/useResponse";
import IconLoader from "@/components/icon/icon-loader";
import IconTrashLines from "@/components/icon/icon-trash-lines";
import IconSend from "@/components/icon/icon-send";
import { ErrorMessage } from "@hookform/error-message";
import clsx from "clsx";

interface Props {
  transaction: TransactionResponse | null;
  onClose: () => void;
  show: boolean;
  revalidatePath: string;
}
type ReviewInput = {
  notes: string;
  action: "APPROVE" | "REJECT";
  code: string;
};
export default function QuickReview({ show, transaction, onClose }: Props) {
  const {
    register,
    setError,
    reset,
    formState: { isValid, errors, touchedFields },
  } = useForm<ReviewInput>({
    mode: "all",
    resolver: zodResolver(TransactionReviewResolver),
  });
  const [pending, startTransition] = useTransition();
  const [state, formAction] = useFormState<State, FormData>(reviewTransaction, null);

  const onSuccess = useCallback(async () => {
    //fetchRevalidatePath(revalidatePath)
    onClose();
    reset();
  }, [onClose, reset]);

  useResponse({
    response: state,
    setError,
    onSuccess,
  });

  const hiddenInputs = (
    <>
      <input type="hidden" {...register("code")} value={transaction?.code} />
    </>
  );
  return (
    <Transition
      show={show}
      appear={true}
      enter="transition ease-out duration-300"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <div
        id="toast-interactive"
        className="mt-4 max-w-[1500px] max-h-[200px] p-2 m-1 text-gray-500 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-400"
        role="alert"
      >
        <div className="flex flex-1 col-span-1">
          <Image
            className="w-8 h-8 rounded-full"
            width={32}
            height={32}
            src={"/assets/images/profile-1.jpeg"}
            alt="user"
          />
          <div className="ms-3 text-sm font-normal w-full">
            <span className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              can You Review this transaction ?
            </span>
            <button title="close" className="text-gray-500 dark:text-gray-400" onClick={() => onClose()}>
              <IconXCircle className="w-5 h-5 absolute right-0 top-0 mr-1 mt-1" />
            </button>
            <form action={(formData: any) => startTransition(() => formAction(formData))}>
              <div className="grid grid-cols-2 gap-2 w-full">
                <div>
                  <TransactionInfo transaction={transaction} />
                </div>
                <div>
                  <Textarea
                    className={clsx("form-textarea p-1 m-0", {
                      "border-red-500": errors.notes && touchedFields,
                    })}
                    placeholder="Your review..."
                    rows={2}
                    {...register("notes", { required: false })}
                  />
                  <ErrorMessage errors={errors} name="notes" />
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="flex flex-auto gap-2 w-full m-1 justify-normal">
                  <div>
                    <input
                      type="radio"
                      id="action-approve"
                      value="APPROVE"
                      className="hidden peer"
                      {...register("action", { required: true })}
                      required
                    />
                    <label
                      htmlFor="action-approve"
                      className="inline-flex text-center items-center justify-between p-1 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <IconChecks className="w-4 h-4 mr-1" />
                      <span className="text-xs">Approve</span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="action-reject"
                      value="REJECT"
                      className="hidden peer"
                      {...register("action", { required: true })}
                    />
                    <label
                      htmlFor="action-reject"
                      className="inline-flex text-center items-center justify-between p-1 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <IconXCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">Reject</span>
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="action-cancel"
                      value="CANCEL"
                      className="hidden peer"
                      {...register("action", { required: true })}
                    />
                    <label
                      htmlFor="action-cancel"
                      className="inline-flex text-center items-center justify-between p-1 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <IconTrashLines className="w-4 h-4 mr-1" />
                      <span className="text-xs">Cancel</span>
                    </label>
                  </div>
                </div>
                {hiddenInputs}
                <div className="pl-5">
                  <button
                    className="mt-1 inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                    type="submit"
                    disabled={!isValid || pending}
                  >
                    {pending && <IconLoader className="w-4 h-4 animate-spin" />}
                    {!pending && (
                      <>
                        <IconSend className="w-4 h-4 mr-2" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  );
}
