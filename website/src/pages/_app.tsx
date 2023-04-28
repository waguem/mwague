import "@/styles/globals.css";

import type { AppContext, AppProps } from "next/app";
import Head from "next/head";
//@ts-ignore
import { FlagsProvider } from "react-feature-flags";
import { SessionProvider } from "next-auth/react";
import { BrowserEnv } from "@/lib/browserEnv";
import flags from "@/src/flags";
import { SWRConfig, SWRConfiguration } from "swr";
import { Chakra } from "@/styles/Chakra";
import { NextPageWithLayout, getDefaultLayout } from "@/ui/Layout";
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
} & AppInitialProps;

const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnMount: true,
};
export default function App({ Component, pageProps: { session, ...pageProps }, cookie, env }: AppPropsWithLayout) {
  if (typeof window === "undefined") {
    (window as unknown as { __env: BrowserEnv }).__env = env;
  }
  // get page lagout if defined
  // otherwise use default layout
  const getLayout = Component.getLayout ?? getDefaultLayout;
  const page = getLayout(<Component {...pageProps} />);

  return (
    <>
      <Head>
        <meta name="description" key="description" content={"description"} />
      </Head>
      <FlagsProvider value={flags}>
        <Chakra cookie={cookie}>
          <SWRConfig value={swrConfig}>
            <SessionProvider session={session}>{page}</SessionProvider>
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
