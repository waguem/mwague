import AgentTableMant from "@/components/apps/agents/AgentTable";
import { getMyAgents } from "@/lib/actions";

export default async function AgentPage() {
  const agents = await getMyAgents();

  return <AgentTableMant agents={agents} />;
}

export const revalidate = 60 * 60 * 3;
