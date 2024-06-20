"use server";

import {
  ApiError,
  openAccountApiV1AccountPost as openAccount,
  getAgentAccountsApiV1AgentAgentInitialAccountGet as getAgentAccountsApi,
} from "../client";
import { AddAgentAccountSchema } from "../schemas/actions";
import { State } from "./state";
import { withToken } from "./withToken";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export async function openAgentAccount(prevState: State, data: FormData): Promise<State> {
  return withToken(async () => {
    const userInput = AddAgentAccountSchema.safeParse(data);
    if (!userInput.success) {
      return {
        status: "error",
        message: "Invalid data",
        errors: userInput.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: `${issue.message}`,
        })),
      };
    }

    try {
      const response = await openAccount({
        requestBody: userInput.data,
      });

      revalidatePath(`/dashboard/agent/${userInput.data.owner_initials}/accounts`);
      return { status: "success", message: `Account ${response.initials} created Successfully` };
    } catch (e) {
      console.log(e);
      if (e instanceof ZodError) {
        return {
          status: "error",
          message: "Invalid dorm data. hree ",
          errors: e.issues.map((issue) => ({
            path: issue.path.join("."),
            message: `Server validation : ${issue.message}`,
          })),
        };
      }

      if (e instanceof ApiError) {
        return {
          status: "error",
          message: e.message,
        };
      }
    }
    return { status: "error", message: "Something went wrong!. Please try again" };
  });
}

export async function getAgentAccounts(initial: string) {
  return withToken(async () => {
    try {
      return await getAgentAccountsApi({
        agentInitial: initial,
      });
    } catch (e) {
      return null;
    }
  });
}
