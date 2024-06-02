export const uriRoles = {
  "/dashboard": [],
  "/dashboard/organizations": ["org_admin"],
};

export function isAuthorized(token: JWT | null, pathname: string) {
  if (token) {
    // check the the user roles match the pathname roles
    return true;
  }

  return isOk;
}
