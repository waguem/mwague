import "server-only";
// import "server-only"
import { AgentReponseWithAccounts, getAgentsApiV1OfficeAgentGet as getOfficeAgentsApi } from "@/lib/client";

import { withToken } from "@/lib/actions/withToken";
export async function getOfficeAgents(): Promise<AgentReponseWithAccounts[]> {
  return withToken(async () => {
    return await getOfficeAgentsApi();
  });
}
