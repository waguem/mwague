"use server";

import { cache } from "react";
import { State } from "./state";
import { withToken } from "./withToken";
import zod from "zod";
import {
  ApiError,
  getActivityApiV1OfficeActivityGet as getCurrentActivityApi,
  startActivityApiV1OfficeActivityPost as startActivityApi,
} from "../client";

const StartFormData = zod.object({
  rates: zod.array(
    zod.object({
      currency: zod.string(),
      rate: zod.number(),
    })
  ),
});

export async function startActivity(prevState: State, data: FormData) {
  return await withToken(async () => {
    const rates = Array.from(data.entries()).map(([currency, rate]) => ({ currency, rate: Number(rate) }));

    const userInput = StartFormData.safeParse({ rates });
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
      await startActivityApi({
        requestBody: userInput.data,
      });
      //revalidatePath("/dashboard/activity");
      return { status: "success", message: "Activity started successfully" };
    } catch (e) {
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

export const getCurrentActivity = cache(async () => {
  return await withToken(async () => {
    return await getCurrentActivityApi();
  });
});
