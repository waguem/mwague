"use client";
import { Button } from "@/ui/Button";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <Button
      type="submit"
      color="cyan"
      className="mt-8 w-full"
      onClick={() =>
        signIn("keycloak", {
          callbackUrl: process.env.KEYCLOAK_REDIRECT_URI || "/",
        })
      }
    >
      Sign in
    </Button>
  );
}
