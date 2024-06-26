"use client";

import ReactSelect from "react-select";

import { Controller, useForm } from "react-hook-form";
import { AccountResponse, AgentReponseWithAccounts } from "@/lib/client";
import { currencySymbols } from "@/lib/utils";
import clsx from "clsx";
import { useMemo, useTransition } from "react";
import IconSend from "@/components/icon/icon-send";
import { useFormState } from "react-dom";
import { State } from "@/lib/actions";
import { addTransaction } from "@/lib/actions/transactions";
import IconLoader from "@/components/icon/icon-loader";
import useResponse from "@/app/hooks/useResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { getResolver } from "@/lib/schemas/transactionsResolvers";
import { ErrorMessage } from "@hookform/error-message";

interface Props {
  agentWithAccounts: AgentReponseWithAccounts[];
}

interface TransactionBase {
  amount: number;
  rate: number;
  currency: string;
  message?: string;
}

interface InternalRequestForm extends TransactionBase {
  sender: string;
  receiver: string;
  type: string;
  charges: number;
}

// interface DepositForm extends TransactionBase{
//     receiver:string;
// }

// interface Customer{
//     name:string;
//     email:string;
//     phone:string;
//     address:string;
//     id:string
// }

// interface SendingForm extends TransactionBase{
//     receiver:string;
//     bid:number;
//     offer:number;
//     paymentcurrency:string;
//     paymentmethod:string;
//     customer:Customer
// }

export default function TransactionForms({ agentWithAccounts }: Props) {
  const {
    register,
    control,
    setError,
    reset,
    getValues,
    formState: { errors, isValid, touchedFields },
  } = useForm<InternalRequestForm>({
    mode: "all",
    resolver: zodResolver(getResolver("INTERNAL")!.resolver),
    defaultValues: {
      sender: "",
      receiver: "",
      type: "INTERNAL",
      currency: "USD",
      amount: 0,
      rate: 0,
      charges: 0,
    },
  });

  const accountsOptions = agentWithAccounts
    .map((agent) => agent.accounts!)
    .flat()
    .map((account: AccountResponse) => ({
      label: `${account.initials} ${currencySymbols[account.currency]}`,
      value: account.initials,
    }));
  const [pending, startTransition] = useTransition();
  const [response, formAction] = useFormState<State, FormData>(addTransaction, null);

  const hiddenInputs = useMemo(() => {
    return ["type", "currency"].map((item: any, index) => {
      return <input key={index} type="hidden" {...register(item)} />;
    });
  }, [register]);

  // revalidate currentPath
  // register for response notification swal
  useResponse({
    response,
    setError,
    reset,
  });

  console.log(errors);
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Add a internal</h2>
        <form action={(formData) => startTransition(() => formAction(formData))}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-1">
              <label htmlFor="sender" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Sender
              </label>
              <Controller
                name="sender"
                control={control}
                render={({ field: { onChange, onBlur } }) => (
                  <ReactSelect
                    id="sender"
                    placeholder="Select a option"
                    options={accountsOptions}
                    {...register("sender")}
                    onChange={(option) => {
                      onChange(option!.value);
                    }}
                    onBlur={onBlur}
                    value={accountsOptions.find((option) => option.value === getValues("sender")) ?? null}
                    className={clsx({
                      "has-error": errors?.sender,
                      "has-success": !errors?.sender,
                    })}
                  />
                )}
              />
              <ErrorMessage
                errors={errors}
                name="sender"
                render={({ message }) => (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    <span className="font-medium">Oops!</span> {message}
                  </p>
                )}
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="receiver" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Receiver
              </label>
              <Controller
                name="receiver"
                control={control}
                render={({ field: { onChange, onBlur } }) => (
                  <ReactSelect
                    id="receiver"
                    placeholder="Select a option"
                    options={accountsOptions}
                    {...register("receiver")}
                    onChange={(option) => {
                      onChange(option!.value);
                    }}
                    value={accountsOptions.find((option) => option.value === getValues("receiver")) ?? null}
                    onBlur={onBlur}
                    className={clsx({
                      "has-error": errors?.receiver,
                      "has-success": !errors?.receiver,
                      dark: true,
                    })}
                  />
                )}
              />
              <ErrorMessage
                render={({ message }) => (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    <span className="font-medium">Oops!</span> {message}
                  </p>
                )}
                errors={errors}
                name="receiver"
              />
            </div>
            <div className="w-full">
              <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                {...register("amount", { required: true, valueAsNumber: true })}
                placeholder="$2999"
                step={"any"}
                className={clsx(
                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500",
                  {
                    "bg-green-50 border-green-500 text-green-900": touchedFields.amount && !errors.amount,
                    "bg-red-50 border-red-500 text-red-900": errors.amount,
                  }
                )}
              />
            </div>
            <div className="w-full">
              <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Rate
              </label>
              <input
                id="rate"
                type="number"
                {...register("rate", { required: true, valueAsNumber: true })}
                placeholder="$1=3.67"
                step={"any"}
                className={clsx(
                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500",
                  {
                    "bg-green-50 border-green-500 text-green-900": touchedFields.rate && !errors.rate,
                    "bg-red-50 border-red-500 text-red-900": errors?.rate,
                  }
                )}
              />
            </div>
            <div className="w-full col-span-2">
              <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your message
              </label>
              <textarea
                id="message"
                rows={4}
                {...register("message")}
                className={clsx(
                  "block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                  {}
                )}
                placeholder="Leave a comment..."
              />
            </div>
            {hiddenInputs}
            <div className="w-full col-span-2 flex justify-center">
              <button
                disabled={!isValid}
                type="submit"
                className="w-full text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#2557D6]/50 me-2 mb-2 justify-center"
              >
                {!pending ? (
                  <IconSend className="w-4 h-4 me-2 -ms-1 text-white" />
                ) : (
                  <IconLoader className="animate-spin me-2 -ms-1 text-white" />
                )}
                Send for approval
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
