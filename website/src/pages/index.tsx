import Head from "next/head";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Hero } from "@/ui/Hero";

const Home = () => {
  const router = useRouter();
  const { t } = useTranslation();
  // const { status } = useSession();
  // const status = "authenticated";
  // useEffect(() => {
  //   if (status === "authenticated") {
  //     router.push("/");
  //   }
  // }, [router, status]);
  return (
    <>
      <Head>
        <title>Test</title>
      </Head>
      <Box as="main" className="oa-basic-theme">
        <Hero />
      </Box>
    </>
  );
};

export default Home;
