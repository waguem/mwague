import { getOfficeApiV1OrganizationOfficeOfficeIdGet as getOfficeById, OfficeResponse } from "@/lib/client";

import InnerPageNavigation from "@/components/layouts/InnerPageNavigation";
import IconHome from "@/components/icon/icon-home";
import IconUsersGroup from "@/components/icon/icon-users-group";
import { setApiToken } from "@/app/hooks/useApi";

import { redirect } from "next/navigation";
import IconFile from "@/components/icon/icon-file";
import IconRefresh from "@/components/icon/icon-refresh";

import IconMoon from "@/components/icon/icon-moon";
import { getServerSession } from "next-auth";
import authOptions from "@/auth.config";
import IconOpenBook from "@/components/icon/icon-open-book";

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
  const office = await getOffice(params.slug);

  if (!office) {
    // redirect to not found page
    redirect("/not-found");
  }

  const getNavigationItems = (office: OfficeResponse) => {
    let items = [
      {
        name: "Transactions",
        url: `/dashboard/office/${office.id}/transactions`,
        icon: <IconRefresh />,
      },
      {
        name: "Office",
        url: `/dashboard/office/${office.id}`,
        icon: <IconHome className="h-5 w-5" />,
      },
      {
        name: "Activities",
        url: "#",
        icon: <IconMoon />,
      },
      {
        name: "Agents",
        url: `/dashboard/office/${office.id}/agents`,
        icon: <IconUsersGroup className="h-5 w-5" />,
      },
      {
        name: "Reports",
        url: `/dashboard/office/${office.id}/reports`,
        icon: <IconFile className="h-5 w-5" />,
      },
    ];

    if (session?.user?.roles.includes("office_admin")) {
      items.push({
        name: "Accounts",
        url: `/dashboard/office/${office.id}/accounts`,
        icon: <IconOpenBook className="h-5 w-5" />,
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
