import { setApiToken } from "@/app/hooks/useApi";
import logger from "../logger";

export const withToken = async (fn: CallableFunction) => {
  try {
    await setApiToken();
    return await fn();
  } catch (e) {
    logger.error(e);
    return { status: "error", message: "Something went wrong!. Please try again" };
  }
};
