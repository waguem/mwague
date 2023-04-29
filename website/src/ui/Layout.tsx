import { Box } from "@chakra-ui/react";
import { NextPage } from "next";
import { HeaderLayout } from "./Header/Header";
import { ToSWrapper } from "./ToSWrapper";
import { Layout } from "lucide-react";
import { SideMenuLayout } from "./SideMenuLayout";

/**
 * define PageLayout
 *
 */
export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  // add this function that each page can override to define each own layout
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export const getDashBoardLayoutSidebarItem = () => {
  return [
    {
      labelID: "dashboard",
      pathname: "/dashboard",
      icon: Layout,
    },
  ];
};

export const getDefaultLayout = (page: React.ReactElement) => <HeaderLayout>{page}</HeaderLayout>;

export const getDashboardLayout = (page: React.ReactElement) => (
  <HeaderLayout>
    <ToSWrapper>
      <SideMenuLayout items={getDashBoardLayoutSidebarItem()}>
        <Box>{page}</Box>
      </SideMenuLayout>
    </ToSWrapper>
  </HeaderLayout>
);
