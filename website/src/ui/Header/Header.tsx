import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Show } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
// import { useSession } from "next-auth/react";
import React from "react";
import { ReactNode } from "react";
import UserMenu from "./UserMenu";
import { ColorModeToggler } from "./ColorModeToggler";
import { LanguageSelector } from "@/ui/LanguageSelector";

function AccountButton() {
  // const { data: session } = useSession();
  const session = null;
  if (session) {
    return null;
  }
  return (
    <Link href="/auth/signin" aria-label="Home">
      <Flex alignItems="center">
        <Button variant="outline">user button</Button>
      </Flex>
    </Link>
  );
}

export const HEADER_HEIGHT = "82px";
export type HeaderProps = { preLogoSlot?: ReactNode; fixed?: boolean };
const ANNOUNCEMENT_CACHE_KEY = "announcement";

export function Header({ preLogoSlot, fixed = true }: HeaderProps) {
  const homeURL = "/";
  const initialShowAnnouncement = "initialShowAnnouncement";
  const [showAnnouncement, setShowAnnouncement] = React.useState(true);
  // function to handle button click
  const handleHideAnnouncement = () => {
    setShowAnnouncement(false);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ANNOUNCEMENT_CACHE_KEY, "announcement");
    }
  };

  return (
    <>
      {initialShowAnnouncement && showAnnouncement && (
        <Box
          zIndex={30}
          position={fixed ? "fixed" : "relative"}
          backgroundColor="yellow.400"
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={3}
        >
          <Text fontSize="lg" mx={4}>
            {"announcement"}
          </Text>
          <Button variant="outline" size="xs" onClick={handleHideAnnouncement}>
            OK
          </Button>
        </Box>
      )}
      <Box
        as="header"
        className="oa-basic-theme"
        display="flex"
        justifyContent="space-between"
        p="4"
        position={fixed ? "fixed" : "relative"}
        zIndex={20}
        w="full"
        height={HEADER_HEIGHT}
        shadow="md"
        gap="3"
      >
        <Flex alignItems="center">
          {preLogoSlot}
          <Flex as={Link} gap="3" href={homeURL} aria-label="Home" alignItems="center">
            <Image src="/images/logos/logo.svg" className="mx-auto object-fill" width="50" height="50" alt="logo" />
            <Text fontSize={["lg", "2xl"]} fontWeight="bold" className="hidden sm:block">
              Title
            </Text>
          </Flex>
        </Flex>
        <Flex alignItems="center" gap={["2", "4"]}>
          <LanguageSelector />
          <AccountButton />
          <UserMenu />
          <ColorModeToggler />
        </Flex>
      </Box>
    </>
  );
}

export const HeaderLayout = ({ children, ...props }: { children: ReactNode } & HeaderProps) => {
  return (
    <>
      <Header {...props}></Header>
      <Box paddingTop={HEADER_HEIGHT} minH={`calc(100vh - ${HEADER_HEIGHT})`} h="full">
        {children}
      </Box>
    </>
  );
};
