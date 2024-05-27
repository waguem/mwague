import { signIn } from "@/auth";

export const loginAction = async () => {
  "use server";
  await signIn("keycloak", { redirectTo: "/dashboard" });
};
