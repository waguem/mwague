import ProvidersReportTable from "@/components/apps/report/ProvidersReportTable";
import ResultTable from "@/components/apps/report/ResultTable";
import IconOpenBook from "@/components/icon/icon-open-book";
import { getMonthlyReport, getOfficeCached } from "@/lib/actions";
import { FOREX_TAGS } from "@/lib/utils";
import { Space, Timeline, TimelineItem, Title } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { getProviderReport } from "../../../../../lib/actions/offices";
export default async function OfficeReportPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: {
    from: string;
    to: string;
  };
}) {
  const monthlyReport = await getMonthlyReport(searchParams?.from, searchParams?.to);
  const office = await getOfficeCached(params.slug);
  const aliPayReport = await getProviderReport(FOREX_TAGS[0],searchParams?.from, searchParams?.to)
  const ttRmbReport = await getProviderReport(FOREX_TAGS[1],searchParams?.from, searchParams?.to)
  const providers = [
    {
      name: FOREX_TAGS[0],
      items: aliPayReport
    },
    {
      name: FOREX_TAGS[1],
      items: ttRmbReport
    },
  ];
  return (
    <Timeline bulletSize={24}>
      <TimelineItem bullet={<IconOpenBook />} title={<Title order={3}> Office Reports </Title>}>
        <Space h="xl" />
        <ResultTable data={monthlyReport.results} office={office} />
      </TimelineItem>
      <TimelineItem bullet={<IconUser />} title={<Title order={3}>Providers Report</Title>}>
        <ProvidersReportTable providers={providers} />
      </TimelineItem>
    </Timeline>
  );
}
