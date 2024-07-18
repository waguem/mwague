import { setApiToken } from "@/app/hooks/useApi";
import logger from "../logger";
import { ApiError } from "../client";

export const withToken = async (fn: CallableFunction) => {
  try {
    await setApiToken();
    return await fn();
  } catch (e) {
    if (e instanceof ApiError) {
      return { status: "error", message: e.body.detail };
    }

    return { status: "error", message: "Something went wrong!. Please try again" };
  }
};
