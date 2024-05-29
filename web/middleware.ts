import { withAuth } from "next-auth/middleware";
import logger from "@/lib/logger";
const unAuthExtentions = ["jpg", "jpeg", "png", "svg"];
export default withAuth({
  callbacks: {
    authorized: async ({ req, token }) => {
      logger.log(req.nextUrl.pathname);
      if (!token) {
        const fileExtension = req.nextUrl.pathname.split(".").pop();
        logger.log("fileExtension : ", fileExtension);
        const basePath = req.nextUrl.pathname.split("/")[0];
        const isOk =
          fileExtension &&
          (req.nextUrl.pathname.startsWith("/assets/images") || basePath === "") &&
          unAuthExtentions.includes(fileExtension);
        return isOk == true;
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _rsc
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|auth/login|favicon.ico).*)",
  ],
};
