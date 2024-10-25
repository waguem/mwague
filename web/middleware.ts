import { NextMiddlewareWithAuth, NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextResponse } from "next/server";
import { checkAuthorization, isPublicURL } from "./lib/auth";

const checkAuth: NextMiddlewareWithAuth = (request: NextRequestWithAuth, event: NextFetchEvent) => {
  if (!request.nextauth.token) {
    if (!isPublicURL(request.nextUrl.pathname)) {
      return NextResponse.redirect("/auth/login");
    }
  }
  return checkAuthorization(request, event);
};

export default withAuth(checkAuth, {
  callbacks: {
    authorized: async ({ token, req }) => {
      if (token) {
        return true;
      }
      return isPublicURL(req.nextUrl.pathname);
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
    "/((?!_next/static|_next/image|_rsc|favicon.ico).*)",
  ],
};
