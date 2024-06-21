import AccountList from "@/components/apps/accounts/AccountList";
import AddAccountForm from "@/components/apps/accounts/AddAccountForm";
import { Fragment } from "react";
import { getAgentAccounts } from "@/lib/actions";

export default async function AgentAccountPage({ params }: { params: { slug: string } }) {
  const accounts = await getAgentAccounts(params.slug);
  return (
    <Fragment>
      <div className="gap-4 p-2">
        <div className="m-2">
          <AddAccountForm initials={params.slug} />
        </div>
        <AccountList accounts={accounts} />
      </div>
    </Fragment>
  );
}
