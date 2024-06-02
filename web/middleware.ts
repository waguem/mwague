import { NextMiddlewareWithAuth, NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";

const unAuthExtentions = ["jpg", "jpeg", "png", "svg"];
const checkAuth: NextMiddlewareWithAuth = async (request: NextRequestWithAuth) => {
  if (!request.nextauth.token) {
    if (!isAuthorized(request.nextauth.token, request.nextUrl.pathname)) {
      return NextResponse.redirect("/auth/login");
    }
  }
  // console.log("Next Auth token ", request.nextauth.token);
  return NextResponse.next();
};

function isAuthorized(token: JWT | null, pathname: string) {
  if (token) {
    return true;
  }

  const fileExtension = pathname.split(".").pop();
  const basePath = pathname.split("/")[0];
  const isOk =
    fileExtension &&
    (pathname.startsWith("/assets/images") || basePath === "") &&
    unAuthExtentions.includes(fileExtension)
      ? true
      : false;
  return isOk;
}
export default withAuth(checkAuth, {
  callbacks: {
    authorized: ({ token, req }) => {
      return isAuthorized(token, req.nextUrl.pathname);
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
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
