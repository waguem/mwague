import { setApiToken } from "@/app/hooks/useApi";

export const withToken = async (fn: CallableFunction) => {
  try {
    await setApiToken();
    return await fn();
  } catch (e) {
    console.error(e);
    return { status: "error", message: "Something went wrong!. Please try again" };
  }
};
