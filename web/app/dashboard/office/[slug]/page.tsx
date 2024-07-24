import OfficeInfo from "@/components/organizations/office/OfficeInfo";

import { setApiToken } from "@/app/hooks/useApi";
import {
  EmployeeResponse,
  getOfficeEmployeesApiV1OfficeOfficeIdEmployeeGet as getEmployeesByOfficeId,
} from "@/lib/client";
import { redirect } from "next/navigation";
import { getOfficeCached } from "@/lib/actions";
import EmployeesTable from "@/components/apps/office/EmployeesTable";
import { OfficeCardImage } from "@/components/organizations/office/OfficeCardImage";
import { Grid, GridCol } from "@mantine/core";

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
      <Grid className="mb-5 gap-5">
        <GridCol span={4}>
          <div className="panel h-full">
            <OfficeCardImage office={office} />
          </div>
        </GridCol>
        <GridCol span={8}>
          <OfficeInfo office={office} />
        </GridCol>
      </Grid>
      <EmployeesTable employees={employees} />
    </div>
  );
}
