import "@/styles/globals.css";
import "focus-visible";
import type { AppContext, AppProps } from "next/app";
import Head from "next/head";
//@ts-ignore
import { FlagsProvider } from "react-feature-flags";
import { SessionProvider } from "next-auth/react";
import { BrowserEnv } from "@/lib/browserEnv";
import flags from "@/src/flags";
import { SWRConfig, SWRConfiguration } from "swr";
import { Chakra } from "@/styles/Chakra";
import { appWithTranslation, useTranslation } from "next-i18next";
import { NextPageWithLayout, getDefaultLayout } from "@/ui/Layout";
import nextI18NextConfig from "@/app/next-i18next.config.js";
import { useEffect } from "react";
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
} & AppInitialProps;

const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnMount: true,
};
function App({ Component, pageProps, cookie, env }: AppPropsWithLayout) {
  // if (typeof window === "undefined") {
  //   (window as unknown as { __env: BrowserEnv }).__env = env;
  // }
  // get page lagout if defined
  // otherwise use default layout
  const getLayout = Component.getLayout ?? getDefaultLayout;
  const page = getLayout(<Component {...pageProps} />);
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  useEffect(() => {
    document.body.dir = direction;
  }, [direction]);

  return (
    <>
      <Head>
        <meta name="description" key="description" content={t("index:description")} />
      </Head>
      <FlagsProvider value={flags}>
        <Chakra cookie={cookie}>
          <SWRConfig value={swrConfig}>
            {/* <SessionProvider session={session}>{page}</SessionProvider> */}
            {page}
          </SWRConfig>
        </Chakra>
      </FlagsProvider>
    </>
  );
}

type AppInitialProps = { env: BrowserEnv; cookie: string };
App.getInitialProps = ({ ctx: { req } }: AppContext): AppInitialProps => {
  return {
    env: {
      NODE_ENV: "development",
      ADMIN_USERS: "admin",
    },
    cookie: req?.headers.cookie || "",
  };
};

export default appWithTranslation(App, nextI18NextConfig);
