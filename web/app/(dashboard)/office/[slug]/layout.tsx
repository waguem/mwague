import { getOfficeApiV1OrganizationOfficeOfficeIdGet as getOfficeById, OfficeResponse } from "@/lib/client";

import InnerPageNavigation from "@/components/layouts/InnerPageNavigation";

import { setApiToken } from "@/app/hooks/useApi";

import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";
import authOptions from "@/auth.config";
import { IconCashRegister, IconHome2, IconReport, IconTransactionDollar, IconUsersGroup } from "@tabler/icons-react";

async function getOffice(slug: string): Promise<OfficeResponse | null> {
  try {
    await setApiToken();
    const office = await getOfficeById({
      officeId: slug,
    });
    return office;
  } catch (e) {
    console.error(e);
  }
  return null;
}

export default async function OfficeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    // redirect to login page
    redirect("/auth/login");
  }
  const office = await getOffice(params.slug);
  if (!office) {
    // redirect to not found page
    redirect("/not-found");
  }

  const getNavigationItems = (office: OfficeResponse) => {
    let items = [
      {
        name: "Office",
        url: `/office/${office.id}`,
        icon: <IconHome2 className="h-5 w-5" />,
      },
      {
        name: "Transactions",
        url: `/office/${office.id}/transactions`,
        icon: <IconTransactionDollar size={18} />,
      },
      {
        name: "Agents",
        url: `/office/${office.id}/agents`,
        icon: <IconUsersGroup className="h-5 w-5" />,
      },
      {
        name: "Reports",
        url: `/office/${office.id}/reports`,
        icon: <IconReport className="h-5 w-5" />,
      },
    ];

    if (session?.user?.roles.includes("office_admin")) {
      items.push({
        name: "Fund",
        url: `/office/${office.id}/accounts`,
        icon: <IconCashRegister className="h-5 w-5" />,
      });
    }

    return items;
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h5 className="text-lg font-semibold dark:text-white-light">{office.name}</h5>
      </div>
      <InnerPageNavigation navItems={getNavigationItems(office)} />
      {children}
    </div>
  );
}
