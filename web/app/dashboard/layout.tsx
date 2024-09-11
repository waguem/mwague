// import { auth } from "@/auth";
import authOptions from "@/auth.config";
import ContentAnimation from "@/components/layouts/content-animation";
import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import MainContainer from "@/components/layouts/main-container";
import Overlay from "@/components/layouts/overlay";
import ScrollToTop from "@/components/layouts/scroll-to-top";
import Setting from "@/components/layouts/setting";
import Sidebar from "@/components/layouts/sidebar";
import Portals from "@/components/portals";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserHeader from "@/components/layouts/UserHeader";
import { NavRoute } from "@/components/layouts/NavRoutes";
import { IconBuildingWarehouse, IconCashRegister, IconTransactionBitcoin, IconWallet } from "@tabler/icons-react";
import { getMyOffice } from "@/lib/actions";
import { OfficeResponse } from "@/lib/client";

function makeRoutes(roles: string[], routes: NavRoute[]): NavRoute[] {
  return routes.filter((route) => route.permissions.some((permission) => roles.includes(permission)));
}
// import { redirect } from "next/navigation";
const ALLOWED_ROLES = ["ogr_admin", "office_admin", "soft_admin", ""];
const ADMINS = ["ogr_admin", "office_admin", "soft_admin"];
export default async function DefaultLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const office: OfficeResponse = await getMyOffice();

  if (!session || !session?.accessToken || !office) {
    redirect("/auth/login");
  }

  const routes: NavRoute[] = makeRoutes(session.user.roles, [
    {
      href: `/dashboard/office/${office.id}`,
      label: "Office",
      icon: <IconBuildingWarehouse size={20} />,
      permissions: ALLOWED_ROLES,
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: <IconCashRegister size={20} />,
      permissions: ADMINS,
    },
    {
      href: `/dashboard/office/${office.id}/transactions`,
      label: "Transactions",
      icon: <IconTransactionBitcoin size={20} />,
      permissions: ADMINS,
    },
    {
      href: `#`,
      label: "Wallets",
      icon: <IconWallet size={20} />,
      permissions: ADMINS,
      children: office.wallets?.map((wallet) => ({
        href: `/dashboard/wallet/${wallet.walletID}`,
        label: wallet.walletID,
        permissions: ADMINS,
      })),
    },
  ]);
  return (
    <>
      {/* BEGIN MAIN CONTAINER */}
      <div className="relative">
        <Overlay />
        <ScrollToTop />

        {/* BEGIN APP SETTING LAUNCHER */}
        <Setting />
        {/* END APP SETTING LAUNCHER */}

        <MainContainer>
          {/* BEGIN SIDEBAR */}
          <Sidebar routes={routes} />
          {/* END SIDEBAR */}
          <div className="main-content flex min-h-screen flex-col">
            {/* BEGIN TOP NAVBAR */}
            <Header UserHeader={<UserHeader session={session} />} />
            {/* END TOP NAVBAR */}

            {/* BEGIN CONTENT AREA */}
            <ContentAnimation>{children}</ContentAnimation>
            {/* END CONTENT AREA */}

            {/* BEGIN FOOTER */}
            <Footer />
            {/* END FOOTER */}
            <Portals />
          </div>
        </MainContainer>
      </div>
    </>
  );
}
