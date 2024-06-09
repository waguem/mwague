import { NextResponse } from "next/server";
import { DEFAULT_ROLE } from "@/lib/contants";
import { NextMiddlewareWithAuth, NextRequestWithAuth } from "next-auth/middleware";

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
      return role.includes(DEFAULT_ROLE);
    }
    if (Array.isArray(this.roles)) {
      console.log("Roles: ", role, " this.roles: ", this.roles);
      return this.roles.some((r) => role.some((item) => item.includes(r)));
    }

    return false;
  }
}

// Define the protection roles for each URI
export const protectedURIs = [
  new ProtectedURI(/^\/dashboard$/, "basic"),
  new ProtectedURI(/^\/dashboard\/organization(\/.*)?$/, ["org_admin"]),
  new ProtectedURI(/^\/dashboard\/office(\/.*)?$/, ["office_admin"]),
  // Add more URIs and their roles here
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
  const token = request.nextauth.token!;
  const pathname = request.nextUrl.pathname;
  if (isPublicURL(pathname)) {
    return NextResponse.next();
  }
  const roles = token.user.roles;
  const protectedUri = protectedURIs.find((uri) => uri.uri.test(pathname));

  if (protectedUri && protectedUri.isAccessibleByRole(roles)) {
    console.log("Authorized");
    return NextResponse.next();
  }
  console.log("Uri ? ", protectedUri);
  console.log("Unauthorized ", pathname, " roles: ", roles);
  // return NextResponse.next();

  return NextResponse.json({ error: "Unauthorized", status: 403 });
};
