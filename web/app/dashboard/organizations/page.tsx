import { setApiToken } from "@/app/hooks/useApi";
import OrganizationTabs from "@/components/organizations/org/OrganizationTab";
import { Metadata } from "next";
import Link from "next/link";
import React, { cache } from "react";
import { getOrgOfficesApiV1OfficeGet as getOfficesApi } from "@/lib/client";
export const metadata: Metadata = {
  title: "Account Setting",
};

export const revalidate = 60 * 60 * 3;

const getOffices = cache(async () => {
  let response: Awaited<ReturnType<typeof getOfficesApi>> = [];
  try {
    await setApiToken();
    return await getOfficesApi();
  } catch (e) {}
  return response;
});

const Page = async () => {
  const offices = await getOffices();
  return (
    <div>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="#" className="text-primary hover:underline">
            Users
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Account Settings</span>
        </li>
      </ul>
      <OrganizationTabs offices={offices} />
    </div>
  );
};

export default Page;
