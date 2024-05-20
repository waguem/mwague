if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
import NextAuth from "next-auth";
import { authOptions } from "@/utils/AuthOptions";
const handler = NextAuth(authOptions);
export {
  handler as GET,
  handler as POST,
}