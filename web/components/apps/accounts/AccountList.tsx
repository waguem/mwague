import IconInfoCircle from "@/components/icon/icon-info-circle";
import { AccountResponse } from "@/lib/client";
import AccountCard from "./AccountCard";
interface Props {
  accounts: AccountResponse[];
}

export default async function AccountList({ accounts }: Props) {
  if (accounts.length === 0) {
    return (
      <div className="!grid items-center justify-center h-96!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
        <div className="mx-auto mb-4 rounded-full text-primary ring-4 ring-primary/30">
          <IconInfoCircle fill={true} className="h-10 w-10" />
        </div>
        No data available.
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-between">
      {accounts.map((account: AccountResponse) => (
        <AccountCard key={account.initials} account={account} />
      ))}
    </div>
  );
}
