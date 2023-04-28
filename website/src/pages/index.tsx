import Head from "next/head";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Hero } from "@/ui/Hero";

const Home = () => {
  const router = useRouter();
  // const { status } = useSession();
  const status = "authenticated";
  const { t } = useTranslation();
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [router, status]);
  return (
    <>
      <Head>
        <title>{"title"}</title>
      </Head>
      <Box as="main" className="oa-basic-theme">
        <Hero />
      </Box>
    </>
  );
};

export default Home;
