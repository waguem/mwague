import Head from "next/head";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation();
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [router, status]);
  return (
    <>
      <Head>
        <title>{"title"}</title>
      </Head>
    </>
  );
};

export default Home;
