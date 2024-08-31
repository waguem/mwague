import OfficeInfo from "@/components/organizations/office/OfficeInfo";

import { setApiToken } from "@/app/hooks/useApi";
import {
  EmployeeResponse,
  getOfficeEmployeesApiV1OfficeOfficeIdEmployeeGet as getEmployeesByOfficeId,
} from "@/lib/client";
import { redirect } from "next/navigation";
import { getOfficeCached, getOfficeHealth } from "@/lib/actions";
import EmployeesTable from "@/components/apps/office/EmployeesTable";
import { Grid, Space } from "@mantine/core";
import Wallets from "@/components/apps/office/Wallets";
import { HealthCheck } from "@/components/organizations/office/HealthCheck";

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
  const getHealthPromise = getOfficeHealth();
  // get current router path

  // Wait for both requests to resolve
  const [office, employees, health] = await Promise.all([officePromise, employeesPromise, getHealthPromise]);

  if (!office) {
    // redirect to not found page
    redirect("/not-found");
  }

  return (
    <div>
      <Grid className="mb-5 gap-5">
        <OfficeInfo HealthCheck={<HealthCheck health={health} />} office={office} />
      </Grid>
      <Space h="xl" />
      <EmployeesTable employees={employees} />
      <Space h="xl" />
      <Space h="xl" />

      <Wallets office={office} />
    </div>
  );
}
