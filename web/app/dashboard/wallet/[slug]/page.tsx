import { WalletTransactions } from "@/components/apps/wallet/WalletTransactions";
import { getMyOffice, getWalletTradings } from "@/lib/actions";
import { OfficeResponse, WalletTradingResponse } from "@/lib/client";
import { redirect } from "next/navigation";
export default async function WalletPage({ params }: { params: { slug: string } }) {
  const officePromise: Promise<OfficeResponse> = getMyOffice();
  const walletTradingsPromise: Promise<WalletTradingResponse[]> = getWalletTradings(params.slug);

  const [office, walletTradings] = await Promise.all([officePromise, walletTradingsPromise]);
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
      <WalletTransactions office={office} wallet={wallet} tradings={walletTradings} />
    </div>
  );
}
