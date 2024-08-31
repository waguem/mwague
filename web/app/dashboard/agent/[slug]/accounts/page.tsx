import AddAccountForm from "@/components/apps/accounts/AddAccountForm";
import { Fragment } from "react";

export default async function AgentAccountPage({ params }: { params: { slug: string } }) {
  return (
    <Fragment>
      <div className="gap-4 p-2">
        <div className="m-2">
          <AddAccountForm initials={params.slug} />
        </div>
      </div>
    </Fragment>
  );
}
