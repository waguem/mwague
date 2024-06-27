import { getAgentTransactions } from "@/lib/actions/transactions";
import TransactionTable from "../../components/TransactionTable";

export default async function TransactionsPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const transactions = await getAgentTransactions(params.slug);
  return <TransactionTable transactions={transactions} slug={params.slug} />;
}
