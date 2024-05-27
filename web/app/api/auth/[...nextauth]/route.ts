if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
import { handlers } from "@/auth"; // Referring to the auth.ts we just created
export const { GET, POST } = handlers;
