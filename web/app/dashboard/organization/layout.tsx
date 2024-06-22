import InnerPageNavigation from "@/components/layouts/InnerPageNavigation";
import IconHome from "@/components/icon/icon-home";
import { getMyOrganizationApiV1OrganizationMeGet as getMyOrgApi } from "@/lib/client";

import IconMapPin from "@/components/icon/icon-map-pin";
import IconSettings from "@/components/icon/icon-settings";
import { cache } from "react";
import { withToken } from "@/lib/actions/withToken";

const getMyOrganization = cache(async () => {
  return withToken(async () => {
    return await getMyOrgApi();
  });
});

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const myOrg = await getMyOrganization();
  const getNavigationItems = () => {
    return [
      {
        name: "Home",
        url: `/dashboard/organization`,
        icon: <IconHome className="h-5 w-5" />,
      },
      {
        name: "Offices",
        url: `/dashboard/organization/offices`,
        icon: <IconMapPin className="h-5 w-5" />,
      },
      {
        name: "Configurations",
        url: "/dashboard/organization/configurations",
        icon: <IconSettings className="h-5 w-5" />,
      },
    ];
  };

  return (
    <div>
      <div className="mb-0 flex items-center justify-between">
        <h5 className="text-lg font-semibold dark:text-white-light badge badge-outline-primary">{myOrg.org_name}</h5>
      </div>
      <InnerPageNavigation navItems={getNavigationItems()} />
      {children}
    </div>
  );
}
