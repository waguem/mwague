import IconAirplay from "@/components/icon/icon-airplay";
import NavLinkHeader from "@/components/layouts/nav-header-link";
import OfficeInfo from "@/components/organizations/office/OfficeInfo";
import OfficePerformance from "@/components/organizations/office/OfficePerformance";
import UsersTable from "@/components/organizations/users/UsersTable";

import { setApiToken } from "@/app/hooks/useApi";
import { OfficeSummary } from "@/components/organizations/office/OfficeSummary";
import {
  EmployeeResponse,
  getOfficeApiV1OrgOrganizationOfficeOfficeIdGet as getOfficeById,
  OfficeResponse,
  getOfficeEmployeesApiV1OrgOfficeOfficeIdEmployeeGet as getEmployeesByOfficeId,
} from "@/lib/client";
import { redirect } from "next/navigation";

const getHeaderNavItems = (office: OfficeResponse) => {
  return [
    {
      href: `/dashboard/office/${office.id}`,
      text: "Office",
    },
    {
      text: office.name,
    },
  ];
};
async function getOffice(slug: string): Promise<OfficeResponse | null> {
  try {
    await setApiToken();
    const office = await getOfficeById({
      officeId: slug,
    });
    return office;
  } catch (e) {
    console.error(e);
  }
  return null;
}

async function getEmployees(officeId: string): Promise<EmployeeResponse[]> {
  try {
    await setApiToken();
    const employees = await getEmployeesByOfficeId({
      officeId,
    });
    return employees;
  } catch (e) {
    console.error(e);
  }
  return [];
}
export default async function Page({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const [office, employees] = await Promise.all([await getOffice(params.slug), await getEmployees(params.slug)]);

  if (!office) {
    // redirect to not found page
    redirect("/not-found");
  }

  return (
    <div className="gap-5">
      <NavLinkHeader items={getHeaderNavItems(office)} />
      <div className="pt-5">
        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3 xl:grid-cols-4">
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light">Office Info</h5>
            </div>
            <OfficeInfo office={office} />
          </div>
          <OfficePerformance />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <OfficeSummary office={office} />
          <div className="panel">
            <div className="mb-10 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light">Pro Plan</h5>
              <button className="btn btn-primary">Renew Now</button>
            </div>
            <div className="group">
              <ul className="mb-7 list-inside list-disc space-y-2 font-semibold text-white-dark">
                <li>10,000 Monthly Visitors</li>
                <li>Unlimited Reports</li>
                <li>2 Years Data Storage</li>
              </ul>
              <div className="mb-4 flex items-center justify-between font-semibold">
                <p className="flex items-center rounded-full bg-dark px-2 py-1 text-xs font-semibold text-white-light">
                  <IconAirplay className="h-3 w-3 ltr:mr-1 rtl:ml-1" />5 Days Left
                </p>
                IconAirplay
                <p className="text-info">$25 / month</p>
              </div>
              <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-dark-light p-0.5 dark:bg-dark-light/10">
                <div
                  className="relative h-full w-full rounded-full bg-gradient-to-r from-[#f67062] to-[#fc5296]"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="panel mt-5">
          <UsersTable users={employees} />
        </div>
      </div>
    </div>
  );
}
