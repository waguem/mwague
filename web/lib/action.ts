import { signIn } from "@/auth";

export const loginAction = async () => {
  "use server";
  const redirectUri = process.env.WEB_DOMAIN ? `${process.env.WEB_DOMAIN}/dashboard` : "/dashboard";
  await signIn("keycloak", { redirectTo: redirectUri });
};
