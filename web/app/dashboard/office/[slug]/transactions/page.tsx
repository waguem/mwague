import TransactionsForms from "@/components/apps/transactions/TransactionsFroms";
import TransactionTable from "@/components/apps/transactions/TransactionTable";
import { getMyOfficeAgents } from "@/lib/actions";
import { getMyOfficeTransactions } from "@/lib/actions/transactions";
import { TransactionResponse } from "@/lib/client";

export default async function Transactions({ params }: { params: { slug: string } }) {
  const transactions: TransactionResponse[] = await getMyOfficeTransactions();
  const sortedTransactions = transactions.sort(
    (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );
  console.log(transactions);
  const agentAccounts = await getMyOfficeAgents();
  return (
    <div className="grid grid-row-2 gap-4">
      <div className="row-span-1 relative flex h-full gap-5 sm:h-[calc(70vh_-_150px)]">
        <TransactionsForms officeId={params.slug} agentAccounts={agentAccounts} />
      </div>
      <div className="panel row-span-1">
        <TransactionTable slug={params.slug} transactions={sortedTransactions} />
      </div>
    </div>
  );
}
