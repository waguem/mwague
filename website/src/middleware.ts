export { default } from "next-auth/middleware";
/**
 * Guards these pages and redirects them to the sign in page.
 */
export const config = {
  matcher: ["/dashboard"],
};
