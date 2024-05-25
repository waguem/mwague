"use client";
import React from "react";
import IconLock from "../icon/icon-lock";
import { signIn } from "next-auth/react";

const ComponentsAuthUnlockForm = () => {
  const submitForm = async (e: any) => {
    e.preventDefault();
    await signIn("keycloak", { callbackUrl: "/dashboard" });
  };
  return (
    <form className="space-y-5" onSubmit={submitForm}>
      <button
        type="submit"
        className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
      >
        <IconLock className="h-4 w-4 shrink-0 ltr:mr-1.5 rtl:ml-1.5" />
        AUTHENTICATE
      </button>
    </form>
  );
};

export default ComponentsAuthUnlockForm;
