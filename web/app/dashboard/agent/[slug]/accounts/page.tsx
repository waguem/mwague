import AgentAccountsList from "@/components/apps/accounts/AccountList";
import AddAgentAccountForm from "@/components/apps/accounts/AddAgentAccountForm";
import { Fragment } from "react";

export default async function AgentAccountPage({ params }: { params: { slug: string } }) {
  const accounts: any[] = [];
  return (
    <Fragment>
      <div className="gap-4 p-2">
        <div className="m-2">
          <AddAgentAccountForm agentInitials={params.slug} />
        </div>
        <AgentAccountsList agentInitials={params.slug} accounts={accounts} />
      </div>
    </Fragment>
  );
}
