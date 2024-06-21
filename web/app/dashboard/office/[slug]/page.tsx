import OfficeInfo from "@/components/organizations/office/OfficeInfo";
import OfficePerformance from "@/components/organizations/office/OfficePerformance";
import UsersTable from "@/components/organizations/users/UsersTable";

import { setApiToken } from "@/app/hooks/useApi";
import {
  EmployeeResponse,
  getOfficeEmployeesApiV1OfficeOfficeIdEmployeeGet as getEmployeesByOfficeId,
} from "@/lib/client";
import { redirect } from "next/navigation";
import { getOfficeCached } from "@/lib/actions";

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
  // Initiate both requests in parallel
  const officePromise = getOfficeCached(params.slug);
  const employeesPromise = getEmployees(params.slug);
  // get current router path

  // Wait for both requests to resolve
  const [office, employees] = await Promise.all([officePromise, employeesPromise]);

  if (!office) {
    // redirect to not found page
    redirect("/not-found");
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <div className="panel">
          <div className="mb-5 flex items-center justify-between">
            <h5 className="text-lg font-semibold dark:text-white-light">Office Info</h5>
          </div>
          <OfficeInfo office={office} />
        </div>
        <OfficePerformance />
      </div>
      <div className="panel mt-5">
        <UsersTable officeId={office.id} users={employees} />
      </div>
    </div>
  );
}
