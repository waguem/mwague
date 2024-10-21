import { getAgentAccounts, getMyOffice } from "@/lib/actions";
import { getAgentTradings } from "@/lib/actions/wallet";
import { TradingsTable } from "@/components/apps/wallet/TradingsTable";
import { Space, Timeline, TimelineItem, Title } from "@mantine/core";
import { IconReport, IconTransactionBitcoin } from "@tabler/icons-react";
import IconBitcoin from "@/components/icon/icon-bitcoin";
import IconOpenBook from "@/components/icon/icon-open-book";
import AgentReports from "@/components/apps/agents/AgentReports";
import { getAgentYearlyReports } from "@/lib/actions/agents";
import AgentCard from "@/components/apps/agents/AgentCard";

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: {
    from: string;
    to: string;
  };
}) {
  const office = await getMyOffice();
  const accounts = await getAgentAccounts(params.slug);
  const tradings = await getAgentTradings(params.slug, searchParams?.from, searchParams?.to);
  const yearlyReports = await getAgentYearlyReports(params.slug, 2024);

  return (
    <Timeline bulletSize={24} lineWidth={1}>
      <TimelineItem bullet={<IconOpenBook />} title={<Title order={3}>Overview</Title>}>
        <Space h="xl" />
        <AgentCard accounts={accounts} />
      </TimelineItem>
      <TimelineItem bullet={<IconTransactionBitcoin size={12} />} title={<Title order={3}>Transactions</Title>}>
        <Space h="xl" />
      </TimelineItem>
      <TimelineItem bullet={<IconBitcoin />} title={<Title order={3}>Tradings</Title>}>
        <Space h="xl" />
        <TradingsTable office={office} tradings={tradings} />
      </TimelineItem>
      <TimelineItem bullet={<IconReport size={12} />} title={<Title order={3}>Reports</Title>}>
        <Space h="xl" />
        <AgentReports reports={yearlyReports} initials={params.slug} />
      </TimelineItem>
    </Timeline>
  );
}
