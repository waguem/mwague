"use client";

import IconCircleCheck from "@/components/icon/icon-circle-check";
import IconXCircle from "@/components/icon/icon-x-circle";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import IconEdit from "@/components/icon/icon-edit";
import IconSearch from "@/components/icon/icon-search";
import Pagination from "./Pagination";
import IconMultipleForwardRight from "@/components/icon/icon-multiple-forward-right";
import IconRefresh from "@/components/icon/icon-refresh";
import { revalidateServerPath } from "@/lib/actions/revalidate";
import QuickReview from "./QuickReview";
import { TransactionResponse } from "@/lib/client";
import { useState } from "react";

interface Props {
  transactions: TransactionResponse[];
  slug: string;
}

export default function TransactionTable({ transactions, slug }: Props) {
  const router = useRouter();
  const visit = (code: string) => {
    router.push(`/dashboard/activity/${slug}/view/${code}`);
  };

  const ucFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const [onReview, setOnReview] = useState<number>(-1);
  return (
    <div>
      <div className="relative flex p-1 items-center">
        <div className="flex-1 justify-center">
          <Tippy content="Refresh data">
            <button
              title="refresh"
              className="btn btn-outline-primary btn-sm"
              onClick={() => revalidateServerPath(`/dashboard/activity/${slug}/transactions`)}
            >
              <IconRefresh className="h-4 w-4" />
            </button>
          </Tippy>
        </div>
        <div className="flex-1 col-span-2 relative">
          <input
            type="text"
            placeholder="Search Transactions..."
            className="peer form-input py-2 ltr:pr-11 rtl:pl-11"
          />
          <button
            title="search"
            type="button"
            className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
          >
            <IconSearch className="mx-auto" />
          </button>
        </div>
      </div>
      {onReview > -1 && (
        <div className="flex w-full flex-row justify-center">
          <QuickReview show={onReview > -1} transaction={transactions[onReview]} onClose={() => setOnReview(-1)} />
        </div>
      )}
      <div className="p-1">
        <div>
          <table className="border-l-1 border table mt-1 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
            <thead className="text-zinc-500 dark:text-zinc-400">
              <tr className="text-xs/5 font-semibold text-zinc-500 dark:text-zinc-400">
                <th className="text-left">Code</th>
                <th className="text-left">Type</th>
                <th className="text-left">Amount</th>
                <th className="text-left">State</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.slice(0, 10).map((transaction: TransactionResponse, index: number) => (
                <tr
                  key={transaction.code}
                  className="text-xs/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-950/5 p-0"
                >
                  <td>
                    <button
                      type="button"
                      className={clsx("flex items-center", {
                        "text-primary": transaction.state === "REVIEW",
                        "text-danger": transaction.state === "CANCELLED",
                        "text-warning": transaction.state === "REJECTED",
                        "text-success": transaction.state === "PAID",
                        "text-info": transaction.state === "PENDING",
                      })}
                      onClick={() => visit(transaction.code)}
                    >
                      <IconMultipleForwardRight className="ltr:mr-1 rtl:ml-1 rtl:rotate-180" />
                      {transaction.code}
                    </button>
                  </td>
                  <td className="text-left">
                    <span
                      className={clsx("badge rounded-full hover:top-0", {
                        "bg-info/20 text-info": transaction.type === "INTERNAL",
                        "bg-primary/20 text-primary": transaction.type === "EXTERNAL",
                        "bg-success/20 text-success": transaction.type === "DEPOSIT",
                        "bg-danger/20 text-danger": transaction.type === "SENDING",
                      })}
                    >
                      {ucFirst(transaction.type.toLowerCase())}
                    </span>
                  </td>
                  <td>${transaction.amount}</td>
                  <td>
                    <span
                      className={clsx("badge shadow-md dark:group-hover:bg-transparent", {
                        "bg-success": transaction.state === "PAID",
                        "bg-danger": transaction.state === "CANCELLED",
                        "bg-warning": transaction.state === "REJECTED",
                        "bg-primary": transaction.state === "REVIEW",
                        "bg-info": transaction.state === "PENDING",
                      })}
                    >
                      {ucFirst(transaction.state.toLowerCase())}
                    </span>
                  </td>
                  <td className="text-center">
                    <ul className="flex items-center justify-center gap-2">
                      {transaction.state === "REVIEW" && (
                        <li>
                          <Tippy content="Approve">
                            <button type="button" title="approve" onClick={() => setOnReview(index)}>
                              <IconCircleCheck className="h-5 w-5 text-success" />
                            </button>
                          </Tippy>
                        </li>
                      )}
                      {transaction.state === "REJECTED" && (
                        <li>
                          <Tippy content="update">
                            <button type="button" title="update">
                              <IconEdit className="h-5 w-5 text-info" />
                            </button>
                          </Tippy>
                        </li>
                      )}
                      {transaction.state !== "CANCELLED" && (
                        <li>
                          <Tippy content="Reject" disabled={transaction.state == "PAID"}>
                            <button
                              className={clsx({
                                "hover:cursor-not-allowed": transaction.state == "PAID",
                              })}
                              type="button"
                              title="reject"
                              disabled={transaction.state == "PAID"}
                            >
                              <IconXCircle className="text-danger" />
                            </button>
                          </Tippy>
                        </li>
                      )}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex w-full flex-col justify-center pt-2">
          <Pagination />
        </div>
      </div>
    </div>
  );
}
