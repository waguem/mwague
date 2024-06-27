"use server";
import "server-only";
import { cache } from "react";
import { withToken } from "./withToken";
import {
  ApiError,
  getAgentTransactionsApiV1AgentInitialsTransactionsGet as getAgentTransactionsApi,
  requestTransactionApiV1TransactionPost as requestTransactionApi,
} from "@/lib/client";
import { State } from "./state";
import { getResolver } from "../schemas/transactionsResolvers";

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
