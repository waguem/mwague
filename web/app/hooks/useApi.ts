import { auth } from "@/auth";
import { OpenAPI } from "@/lib/client";
import logger from "@/lib/logger";

export default async function useApi() {
  const session = await auth();
  logger.log("Auth session : ", session);
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.HEADERS = {
    ...OpenAPI.HEADERS,
    Authorization: `bearer ${session?.accessToken}`,
  };
  return session;
}
