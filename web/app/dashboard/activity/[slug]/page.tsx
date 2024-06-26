import { getAgentTransactions } from "@/lib/actions/transactions";
import TransactionTable from "./components/TransactionTable";

export default async function AgentActivityPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const transactions = await getAgentTransactions(params.slug);
  return <TransactionTable transactions={transactions} />;
}
