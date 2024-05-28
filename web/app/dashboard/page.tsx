import { Metadata } from "next";
import React from "react";
import { getOrganizationsApiV1OrgOrganizationGet as getOrganizations } from "@/lib/client";
import useApi from "@/app/hooks/useApi";

export const metadata: Metadata = {
  title: "Admin",
};

const Organization = async () => {
  // set session token to OpenAPI headers
  await useApi();

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

export default Organization;
