import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Show } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import React from "react";
import { ReactNode } from "react";

function AccountButton() {
  const { data: session } = useSession();
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

export function Header({ preLogoSlot, fixed = true }: HeaderProps) {
  return (
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
      <Flex alignItems="center" gap={["2", "4"]}>
        <p>nothing</p>
      </Flex>
    </Box>
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
