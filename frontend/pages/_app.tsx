import type { AppProps } from "next/app";
import { useState } from "react";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider, Layout } from "antd";
import enGB from "antd/locale/en_GB";
import { OpenAPI } from "open-api";
import CheckSession from "../component/auth/CheckSession";
import Header from "../component/header";
import theme from "../theme";

const { Content } = Layout;

// Runs once per module load (server + client). The spec's operation paths already
// include "/api/...", so OpenAPI.BASE must be the backend origin, not the /api base.
OpenAPI.BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api").replace(
  /\/api\/?$/,
  ""
);

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: 1000 * 60 * 5,
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  );

  return (
    <>
      <Head>
        <title>PRMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={session}>
        <CheckSession />
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={theme} locale={enGB}>
            <Layout style={{ minHeight: "100vh" }}>
              <Header />
              <Content style={{ padding: "28px 32px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
                <Component {...pageProps} />
              </Content>
            </Layout>
          </ConfigProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}
