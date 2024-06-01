import authOptions from "@/auth.config";
import { OpenAPI } from "@/lib/client";
import { getServerSession } from "next-auth";

export default async function useApi() {
  return setApiToken();
}

export async function setApiToken() {
  const session = await getServerSession(authOptions);
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.HEADERS = {
    ...OpenAPI.HEADERS,
    Authorization: `bearer ${session?.accessToken}`,
  };
  return session;
}
