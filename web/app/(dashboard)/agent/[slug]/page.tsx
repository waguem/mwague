import { getAgentAccounts, getEmployeesCached, getMyOffice, getOfficeAccountsCached } from "@/lib/actions";
import { getAgentTradings } from "@/lib/actions/wallet";
import { Space, Timeline, TimelineItem, Title } from "@mantine/core";
import { IconReport, IconTransactionBitcoin } from "@tabler/icons-react";
import IconBitcoin from "@/components/icon/icon-bitcoin";
import IconOpenBook from "@/components/icon/icon-open-book";
import AgentReports from "@/components/apps/agents/AgentReports";
import { getAgentYearlyReports, getMyOfficeAgents } from "@/lib/actions/agents";
import AgentCard from "@/components/apps/agents/AgentCard";
import { WalletTransactions } from "@/components/apps/wallet/WalletTransactions";
import { AccountResponse, AgentReponseWithAccounts } from "@/lib/client";
import TransactionTable from "@/components/apps/transactions/TransactionTable";
import { getAgentTransactions } from "@/lib/actions/transactions";
import { AllTransactions } from "@/lib/types";

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
  const officePr = getMyOffice();
  const accountsPr = getAgentAccounts(params.slug);
  const officeAccountsPromise: Promise<AccountResponse[]> = getOfficeAccountsCached();
  const agentsPromise: Promise<AgentReponseWithAccounts[]> = getMyOfficeAgents();
  const agentTransactionsPr: Promise<AllTransactions[]> = getAgentTransactions(params.slug);

  const tradingsPr = getAgentTradings(params.slug, searchParams?.from, searchParams?.to);
  const yearlyReportsPr = getAgentYearlyReports(params.slug, 2024);

  const [office, accounts, officeAccounts, agents, tradings, yearlyReports, transactions] = await Promise.all([
    officePr,
    accountsPr,
    officeAccountsPromise,
    agentsPromise,
    tradingsPr,
    yearlyReportsPr,
    agentTransactionsPr,
  ]);
  const employees = await getEmployeesCached(office.id);
  return (
    <Timeline bulletSize={24} lineWidth={1}>
      <TimelineItem bullet={<IconOpenBook />} title={<Title order={3}>Overview</Title>}>
        <Space h="xl" />
        <AgentCard accounts={accounts} />
      </TimelineItem>
      <TimelineItem bullet={<IconTransactionBitcoin size={12} />} title={<Title order={3}>Transactions</Title>}>
        <Space h="xl" />
        <TransactionTable office={office} employees={employees} data={transactions} />
      </TimelineItem>
      <TimelineItem bullet={<IconBitcoin />} title={<Title order={3}>Tradings</Title>}>
        <Space h="xl" />
        <WalletTransactions officeAccounts={officeAccounts} office={office} tradings={tradings} agents={agents} />
      </TimelineItem>
      <TimelineItem bullet={<IconReport size={12} />} title={<Title order={3}>Reports</Title>}>
        <Space h="xl" />
        <AgentReports reports={yearlyReports} initials={params.slug} />
      </TimelineItem>
    </Timeline>
  );
}
