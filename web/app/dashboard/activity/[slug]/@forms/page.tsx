import { getMyOfficeAgents } from "@/lib/actions";
import TransactionForms from "../components/TransactionForms";

export default async function AgentTransactions({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  console.log(params);
  const agentWithAccounts = await getMyOfficeAgents();
  console.log(agentWithAccounts);
  return (
    <div>
      <TransactionForms agentWithAccounts={agentWithAccounts} />
    </div>
  );
}
