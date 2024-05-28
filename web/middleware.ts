export { auth as middleware } from "./auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _rsc
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_rsc|_next/image|favicon.ico).*)",
  ],
};
