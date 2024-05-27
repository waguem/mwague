import { Metadata } from "next";
import React from "react";
import { getOrganizationsApiV1OrgOrganizationGet as getOrganizations } from "@/lib/client";
import { OpenAPI } from "@/lib/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin",
};

const Sales = async () => {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/auth/login");
  }
  // TODO use a hook to set the session token
  // add  access_token to request
  OpenAPI.interceptors.request.use((req) => {
    req.headers = {
      ...req.headers,
      Authorization: `bearer ${session?.accessToken}`,
    };
    return req;
  });
  const organizations: Awaited<ReturnType<typeof getOrganizations>> = await getOrganizations();

  return (
    <div>
      Your oganizations
      <ul>
        {organizations.map((org) => (
          <li key={org.initials}>{org.org_name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Sales;
