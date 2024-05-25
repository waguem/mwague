"use client";
import React from "react";
import { signOut } from "next-auth/react";
import IconLogout from "../icon/icon-logout";
import { getTranslation } from "@/i18n";

const SignOutButton = () => {
  const { t } = getTranslation();
  return (
    <button type="button" className={`nav-link group w-full`} onClick={async () => await signOut()}>
      <div className="flex items-center">
        <IconLogout className="shrink-0 group-hover:!text-primary" />
        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
          {t("Logout")}
        </span>
      </div>
    </button>
  );
};

export default SignOutButton;
