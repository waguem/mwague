import { signIn } from "next-auth/react";

export const loginAction = async () => {
  // "use server";
  await signIn("keycloak", { callbackUrl: "/dashboard" });
};
