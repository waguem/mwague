import TransactionsForms from "@/components/apps/transactions/TransactionsFroms";
import { getMyOfficeAgents } from "@/lib/actions";
import { getMyOfficeTransactions } from "@/lib/actions/transactions";
import { TransactionResponse } from "@/lib/client";
import MantineReactTable from "@/components/apps/transactions/MantineReactTable";

export default async function Transactions({ params }: { params: { slug: string } }) {
  const transactions: TransactionResponse[] = await getMyOfficeTransactions();
  const agentAccounts = await getMyOfficeAgents();

  return (
    <div className="grid grid-row-2 gap-4">
      <div className="row-span-1 relative flex h-full gap-5 sm:h-[calc(70vh_-_150px)]">
        <TransactionsForms officeId={params.slug} agentAccounts={agentAccounts} />
      </div>
      <div>
        <MantineReactTable data={transactions} />
      </div>
    </div>
  );
}
