import { WalletTransactions } from "@/components/apps/wallet/WalletTransactions";
import { getMyOffice, getMyOfficeAgents, getOfficeAccountsCached, getWalletTradings } from "@/lib/actions";
import { AccountResponse, AgentReponseWithAccounts, OfficeResponse, WalletTradingResponse } from "@/lib/client";
import { redirect } from "next/navigation";
import { Space, Timeline, TimelineItem, Title } from "@mantine/core";
import { IconReport, IconTransactionBitcoin } from "@tabler/icons-react";
import IconOpenBook from "@/components/icon/icon-open-book";
import WalletCard from "@/components/apps/wallet/WalletCard";
export default async function WalletPage({ params }: { params: { slug: string } }) {
  const officePromise: Promise<OfficeResponse> = getMyOffice();
  const walletTradingsPromise: Promise<WalletTradingResponse[]> = getWalletTradings(params.slug);
  const officeAccountsPromise: Promise<AccountResponse[]> = getOfficeAccountsCached();
  const agentsPromise: Promise<AgentReponseWithAccounts[]> = getMyOfficeAgents();
  const [office, walletTradings, officeAccounts, agents] = await Promise.all([
    officePromise,
    walletTradingsPromise,
    officeAccountsPromise,
    agentsPromise,
  ]);
  if (!office) {
    redirect("/auth/login");
  }
  const wallet = office.wallets?.find((wallet) => wallet.walletID === params.slug);
  if (!wallet) {
    // redirect not found
    redirect("/not-found");
  }

  return (
    <Timeline bulletSize={24} lineWidth={1}>
      <TimelineItem bullet={<IconOpenBook />} title={<Title order={3}> Overview</Title>}>
        <Space h="xl" />
        <WalletCard wallet={wallet} />
      </TimelineItem>
      <TimelineItem bullet={<IconTransactionBitcoin size={12} />} title={<Title order={3}>Tradings</Title>}>
        <Space h="xl" />
        <WalletTransactions
          officeAccounts={officeAccounts}
          office={office}
          wallet={wallet}
          tradings={walletTradings}
          agents={agents}
        />
      </TimelineItem>
      <TimelineItem bullet={<IconReport size={12} />} title={<Title order={3}>Reports</Title>}></TimelineItem>
    </Timeline>
  );
}
