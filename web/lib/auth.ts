import { NextResponse } from "next/server";
import { NextMiddlewareWithAuth, NextRequestWithAuth } from "next-auth/middleware";
import logger from "@/lib/logger";
const unAuthExtentions = ["jpg", "jpeg", "png", "svg"];

class ProtectedURI {
  uri: RegExp;
  roles: string[] | string;

  constructor(uri: RegExp, roles: string[] | string) {
    this.uri = uri;
    this.roles = roles;
  }

  isAccessibleByRole(role: string[]) {
    // if this.roles is a string, then it is a public URI
    if (typeof this.roles === "string" && this.roles === "basic") {
      return role.length >= 0;
    }
    if (Array.isArray(this.roles)) {
      return this.roles.some((r) => role.some((item) => item.includes(r)));
    }

    return false;
  }
}

// Define the protection roles for each URI
export const protectedURIs = [
  new ProtectedURI(/^\/dashboard$/, "basic"),
  new ProtectedURI(/^\/dashboard\/org(\/.*)?$/, ["org_admin"]),
  new ProtectedURI(/^\/dashboard\/organization(\/.*)?$/, ["org_admin"]),
  new ProtectedURI(/^\/dashboard\/office(\/.*)?$/, ["office_admin"]),
  new ProtectedURI(/^\/dashboard\/wallet(\/.*)?$/, ["office_admin"]),
  new ProtectedURI(/^\/dashboard\/agent(\/.*)?$/, "basic"),
  new ProtectedURI(/^\/dashboard\/payments$/, "basic"),
  new ProtectedURI(/^\/$/, "basic"),
  // Add more URIs and their roles here
  // new ProtectedURI(/^\/dashboard\/activity$/, "basic"),
  // new ProtectedURI(/^\/dashboard\/activity\/[a-zA-Z]+$/, "basic"),
  // new ProtectedURI(/^\/dashboard\/activity\/[a-zA-Z]{1,9}\/.*$/, "basic"),
  // next internal api urls
  // add new uri for /payments for everyone
  new ProtectedURI(/^\/api\/.*$/, "basic"),
];

export function isPublicURL(pathname: string) {
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

export const checkAuthorization: NextMiddlewareWithAuth = (request: NextRequestWithAuth) => {
  const startTime = Date.now();
  const token = request.nextauth.token!;
  const pathname = request.nextUrl.pathname;
  let response: NextResponse | undefined = undefined;
  if (isPublicURL(pathname)) {
    response = NextResponse.next();
    const processingTime = Date.now() - startTime;
    logger.log(`Request: ${request.method} ${request.nextUrl.pathname}, Processing Time: ${processingTime} ms`);
    return response;
  }

  const roles = token.user.roles;

  const protectedUri = protectedURIs.find((uri) => uri.uri.test(pathname));
  if (protectedUri && protectedUri.isAccessibleByRole(roles)) {
    response = NextResponse.next();
    const processingTime = Date.now() - startTime;
    logger.log(`Request: ${request.method} ${request.nextUrl.pathname}, Processing Time: ${processingTime} ms`);
    return response;
  }

  return NextResponse.json({ error: "Unauthorized", status: 403 });
};
