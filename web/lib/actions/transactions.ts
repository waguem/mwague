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
  GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetResponse,
  addPaymentApiV1TransactionCodePayPost,
  updateTransactionApiV1TransactionCodePut,
} from "@/lib/client";
import { State } from "./state";
import { getResolver } from "../schemas/transactionsResolvers";
import { PaymentResolver, TransactionReviewResolver, PaymentRequest } from "../schemas/actions";
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
  return withToken(async () => {
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
        console.log(e.body);
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
  });
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
    console.log(data);

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
    const transaction: GetOfficeTransactionsWithDetailsApiV1TransactionCodeGetResponse = await getTransactionByCode({
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
        rate: transaction.rate ?? 0,
      },
      charges: {
        amount: "charges" in transaction ? transaction.charges : 0,
        rate: transaction.rate ?? 0,
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

export const payTransaction = async (officeId: string, data: PaymentRequest): Promise<State> => {
  return withToken(async () => {
    const validation = PaymentResolver.safeParse(data);
    if (!validation.success) {
      console.log(validation.error);
      return {
        status: "error",
        message: "Invalid payment data",
      };
    }

    const response = await addPaymentApiV1TransactionCodePayPost({
      code: validation.data.code,
      requestBody: {
        amount: Number(validation.data.mainAmount),
        payment_type: validation.data.type,
        rate: Number(validation.data.rate),
        customer: {
          name: validation.data.customerName,
          phone: validation.data.customerPhone ?? "",
        },
        notes: validation.data.notes,
      },
    });

    revalidatePath("/dashboard/office/[slug]/transactions");

    return {
      status: "success",
      message: `${validation.data.type} Transaction ${validation.data.code} paid ${response.amount} successfully`,
    };
  });
};

export const updateTransaction = async (officeId: string, data: any): Promise<State> => {
  return withToken(async () => {
    // make sure amount is a positive number and rate a positive number and charge a positive number
    if (data.amount <= 0 || data.rate <= 0 || data.charges < 0) {
      return {
        status: "error",
        message: "Invalid amount, rate or charges",
      };
    }

    const response = await updateTransactionApiV1TransactionCodePut({
      code: data.code ?? "",
      requestBody: {
        currency: "USD",
        transaction_type: data.type,
        amount: {
          amount: data.amount ?? 0,
          rate: data.rate ?? 0,
        },
        charges: {
          amount: data.charges ?? 0,
          rate: data.rate ?? 1,
        },
      },
    });

    revalidatePath(`/dashboard/office/${officeId}/transactions`);

    return {
      status: "success",
      message: `Transaction ${response.code} updated successfully`,
    };
  });
};
