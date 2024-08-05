import AccountList from "@/components/apps/accounts/AccountList";
import AddAgentAccountForm from "@/components/apps/accounts/AddAccountForm";
import { getOfficeAccountsCached, getOfficeCached } from "@/lib/actions";

export default async function OfficeAccountsPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const officePromise = getOfficeCached(params.slug);
  const accountsPromise = getOfficeAccountsCached();

  const [office, accounts] = await Promise.all([officePromise, accountsPromise]);
  const hasFund = accounts.some((account: any) => account.type === "FUND");
  const hasOffice = accounts.some((account: any) => account.type === "OFFICE");
  return (
    <div className="gap-2 p-2">
      <div className="m-2">
        {(!hasFund || !hasOffice) && (
          <AddAgentAccountForm initials={office.initials} type={hasFund ? "OFFICE" : "FUND"} />
        )}
      </div>
      <AccountList accounts={accounts} />
    </div>
  );
}
