"use server";
import "server-only";
import { cache } from "react";
import { withToken } from "./withToken";
import {
  ApiError,
  getAgentTransactionsApiV1AgentInitialsTransactionsGet as getAgentTransactionsApi,
  requestTransactionApiV1TransactionPost as requestTransactionApi,
  getOfficeTransactionsWithDetailsApiV1TransactionCodeGet as getTransactionByCode,
  reviewTransactionApiV1TransactionTransactionCodeReviewPost as reviewTransactionApi,
  getOfficeTransactionsApiV1OfficeTransactionsGet as getOfficeTransactionsApi,
  TransactionReviewReq,
} from "@/lib/client";
import { State } from "./state";
import { getResolver } from "../schemas/transactionsResolvers";
import { TransactionReviewResolver } from "../schemas/actions";
import { revalidatePath } from "next/cache";

export const getMyOfficeTransactions = cache(async () => {
  return withToken(async () => {
    return await getOfficeTransactionsApi();
  });
});

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
    revalidatePath("/dashboard/office/[slug]/transactions");
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

export interface ReviewFormData extends FormData {
  code: string;
  action: string;
  notes: string;
  officeId: string;
}

export const reviewTransaction = async (prevSate: State, data: ReviewFormData): Promise<State> => {
  return withToken(async () => {
    const validation = TransactionReviewResolver.safeParse(data);
    const { officeId } = data;
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
            message: "should have comments",
          },
        ],
      };
    }

    // get the transaction by code
    const transaction = await getTransactionByCode({
      code: validation.data.code,
      trType: validation.data.type,
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
      state:
        validation.data.action === "APPROVE"
          ? "APPROVED"
          : validation.data.action === "REJECT"
          ? "REJECTED"
          : "CANCELLED",
      type: transaction.type,
    };

    const response = await reviewTransactionApi({
      transactionCode: transaction.code,
      requestBody: reviewInput,
    });

    revalidatePath(
      officeId.length > 0 ? `/dashboard/office/${officeId}/transactions` : "/dashboard/office/[slug]/transactions"
    );

    return {
      message: `Transaction ${response.code} has been ${validation.data.action} successfully`,
      status: "success",
    };
  });
};
