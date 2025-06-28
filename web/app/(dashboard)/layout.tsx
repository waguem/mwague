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
import { NavRoute, NavSection } from "@/components/layouts/NavRoutes";
import {
  IconBook,
  IconBuildingWarehouse,
  IconCashRegister,
  IconReport,
  IconTransactionBitcoin,
  IconUsersGroup,
  IconWallet,
} from "@tabler/icons-react";
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
  const officeRoutesChildren: NavRoute[] = [
    {
      href: `/office/${office.id}/accounts`,
      label: "Accounts",
      permissions: ALLOWED_ROLES,
      icon: <IconBook size={20} />,
    },
    {
      href: `/office/${office.id}/agents`,
      label: "Agents",
      permissions: ADMINS,
      icon: <IconUsersGroup size={20} />,
    },
    {
      href: `/office/${office.id}/reports`,
      label: "Reports",
      permissions: ADMINS,
      icon: <IconReport size={20} />,
    },
  ];

  const routes: NavRoute[] = makeRoutes(session.user.roles, [
    {
      href: `/office/${office.id}`,
      label: "Office",
      icon: <IconBuildingWarehouse size={20} />,
      permissions: ALLOWED_ROLES,
      children: officeRoutesChildren,
    },
    {
      href: "/payments",
      label: "Payments",
      icon: <IconCashRegister size={20} />,
      permissions: ADMINS,
    },
    {
      href: `/office/${office.id}/transactions`,
      label: "Transactions",
      icon: <IconTransactionBitcoin size={20} />,
      permissions: ADMINS,
    },
  ]);

  const navSection: NavSection[] = [
    {
      section: "OFFICE",
      routes: routes,
    },
  ];

  if (office.wallets?.length) {
    navSection.push({
      section: "WALLETS",
      routes: office
        .wallets!.sort((a, b) => (a.wallet_type! > b.wallet_type! ? 1 : -1))
        ?.map((wallet) => ({
          href: `/wallet/${wallet.walletID}`,
          badge:
            wallet.wallet_type === "CRYPTO"
              ? `${wallet.crypto_currency}-${wallet.trading_currency}`
              : `${wallet.trading_currency}`,
          permissions: ADMINS,
          label: wallet.wallet_name?.split(" ")[0] ?? "",
          icon: <IconWallet size={20} />,
        })),
    });
  }
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
          <Sidebar sections={navSection} />
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
