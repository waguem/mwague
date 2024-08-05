import { WalletTransactions } from "@/components/apps/wallet/WalletTransactions";
import { getMyOffice, getOfficeAccountsCached, getWalletTradings } from "@/lib/actions";
import { AccountResponse, OfficeResponse, WalletTradingResponse } from "@/lib/client";
import { redirect } from "next/navigation";
export default async function WalletPage({ params }: { params: { slug: string } }) {
  const officePromise: Promise<OfficeResponse> = getMyOffice();
  const walletTradingsPromise: Promise<WalletTradingResponse[]> = getWalletTradings(params.slug);
  const officeAccountsPromise: Promise<AccountResponse[]> = getOfficeAccountsCached();

  const [office, walletTradings, officeAccounts] = await Promise.all([
    officePromise,
    walletTradingsPromise,
    officeAccountsPromise,
  ]);
  if (!office) {
    redirect("/auth/login");
  }
  const wallet = office.wallets?.find((wallet) => wallet.walletID === params.slug);
  if (!wallet) {
    // redirect not found
    redirect("/not-found");
  }

  return (
    <div>
      <WalletTransactions officeAccounts={officeAccounts} office={office} wallet={wallet} tradings={walletTradings} />
    </div>
  );
}
