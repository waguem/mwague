"use server";
import "server-only";
import { cache } from "react";
import { withToken } from "./withToken";
import {
  ApiError,
  getAgentTransactionsApiV1AgentInitialsTransactionsGet as getAgentTransactionsApi,
  requestTransactionApiV1TransactionPost as requestTransactionApi,
  getTransactionApiV1TransactionCodeGet as getTransactionByCode,
  reviewTransactionApiV1TransactionTransactionCodeReviewPost as reviewTransactionApi,
  TransactionReviewReq,
} from "@/lib/client";
import { State } from "./state";
import { getResolver } from "../schemas/transactionsResolvers";
import { TransactionReviewResolver } from "../schemas/actions";

export const getAgentTransactions = cache(async (initials: string) => {
  return withToken(async () => {
    return await getAgentTransactionsApi({ initials });
  });
});

export async function addTransaction(prevSate: State, data: FormData): Promise<State> {
  const resolver = getResolver(data.get("type") as string);
  if (!resolver) {
    return { message: "Invalid transaction type", status: "error" };
  }

  const validation = resolver.run(data);
  if ("status" in validation) {
    return {
      message: validation.message ?? "Invalid transaction data",
      status: "error",
      errors: validation.errors,
    };
  }

  try {
    const response = await requestTransactionApi({
      requestBody: validation,
    });

    return { message: `${response.type} Transaction ${response.code} added successfully`, status: "success" };
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        status: "error",
        message: e.message,
      };
    }
  }

  // something went wrong
  return {
    status: "error",
    message: "An error occurred while processing the transaction",
  };
}

export const reviewTransaction = async (prevSate: State, data: FormData) => {
  return withToken(async () => {
    const validation = TransactionReviewResolver.safeParse(data);
    console.log(validation.error);
    if (!validation.success) {
      return { message: "Invalid review data", status: "error" };
    }
    // if state is not approve then make sur there's a not before proceeding
    if (validation.data.action !== "APPROVE" && (!validation.data.notes || validation.data.notes?.trim() === "")) {
      return {
        message: "Invalid Review",
        status: "error",
        errors: [
          {
            path: "notes",
            message: "Add comment",
          },
        ],
      };
    }

    // get the transaction by code
    const transaction = await getTransactionByCode({
      code: validation.data.code,
    });
    // make sure the transaction is not already reviewed
    if (transaction.state !== "REVIEW") {
      return {
        message: "Transaction already reviewed",
        status: "error",
      };
    }

    // input
    const reviewInput: TransactionReviewReq = {
      amount: {
        amount: transaction.amount,
        rate: transaction.rate,
      },
      code: transaction.code,
      notes: validation.data.notes,
      currency: "USD",
      state: validation.data.action === "APPROVE" ? "APPROVED" : "REJECTED",
      type: transaction.type,
      charges: {
        amount: transaction.charges ?? 0,
        rate: transaction.rate,
      },
    };

    const response = await reviewTransactionApi({
      transactionCode: transaction.code,
      requestBody: reviewInput,
    });

    return {
      message: `Transaction ${response.code} has been ${validation.data.action} successfully`,
      status: "success",
    };
  });
};
