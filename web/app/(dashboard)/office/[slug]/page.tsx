import OfficeInfo from "@/components/organizations/office/OfficeInfo";

import { setApiToken } from "@/app/hooks/useApi";
import {
  EmployeeResponse,
  getOfficeEmployeesApiV1OfficeOfficeIdEmployeeGet as getEmployeesByOfficeId,
} from "@/lib/client";
import { redirect } from "next/navigation";
import { getOfficeCached, getOfficeHealth } from "@/lib/actions";
import EmployeesTable from "@/components/apps/office/EmployeesTable";
import { Grid, Space, Timeline, TimelineItem, Title } from "@mantine/core";
import Wallets from "@/components/apps/office/Wallets";
import { HealthCheck } from "@/components/organizations/office/HealthCheck";
import IconOpenBook from "@/components/icon/icon-open-book";
import { IconUsersGroup, IconWallet } from "@tabler/icons-react";

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
    <Timeline bulletSize={24} lineWidth={1}>
      <TimelineItem bullet={<IconOpenBook />} title={<Title order={3}>Overview</Title>}>
        <Space h="xl" />
        <Grid className="mb-5 gap-5">
          <OfficeInfo HealthCheck={<HealthCheck health={health} />} office={office} />
        </Grid>
      </TimelineItem>
      <TimelineItem bullet={<IconUsersGroup size={12} />} title={<Title order={3}>Employees</Title>}>
        <Space h="xl" />
        <EmployeesTable employees={employees} />
      </TimelineItem>
      <TimelineItem bullet={<IconWallet size={12} />} title={<Title order={3}>Wallets</Title>}>
        <Space h="xl" />
        <Wallets office={office} />
      </TimelineItem>
    </Timeline>
  );
}
