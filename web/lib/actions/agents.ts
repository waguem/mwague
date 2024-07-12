"use server";
import "server-only";

import { AddAgentSchema } from "../schemas/actions";
import { State } from "./state";
import { withToken } from "./withToken";
import {
  createAgentApiV1OfficeAgentPost as createAgentApi,
  getAgentsApiV1OfficeAgentGet as getMyAgentsApi,
  getOfficeAgentsApiV1OfficeOfficeIdAgentGet as getOfficeAgentsApi,
} from "@/lib/client";
import { ZodError } from "zod";
import { ApiError } from "../client";
import { revalidatePath } from "next/cache";
import { cache } from "react";

/**
 * Add an agent to the office
 * @param prevState
 * @param data
 * @returns
 */
export async function addAgent(prevState: State, data: FormData): Promise<State> {
  return await withToken(async () => {
    const userInput = AddAgentSchema.safeParse(data);

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
      const response = await createAgentApi({
        requestBody: userInput.data,
      });
      revalidatePath("/dashboard/office/[slug]/agents");
      return { status: "success", message: `Agent ${response.name} Added Successfully` };
    } catch (e) {
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

export async function getOfficeAgents(officeId: string) {
  return await withToken(async () => {
    try {
      const response = await getOfficeAgentsApi({
        officeId,
      });
      return response;
    } catch (e) {
      console.error(e);
      return [];
    }
  });
}

export const getMyAgents = cache(async () => {
  return withToken(async () => {
    return await getMyAgentsApi();
  });
});

// import "server-only"
import { AgentReponseWithAccounts, getAgentsApiV1OfficeAgentGet as getMyOfficeAgentsApi } from "@/lib/client";

export const getMyOfficeAgents = cache((): Promise<AgentReponseWithAccounts[]> => {
  return withToken(async () => {
    return await getMyOfficeAgentsApi();
  });
});
