import ClientConfig, { API, ClientConfigENV } from "@/API/API";
import { UserDTO } from "@/API/NauthApi_gen";
import Layout from "@/components/layout/layout";
import { NauthRealtimeProvider, useNauthRealtime } from "@/hooks/NauthRealtimeContext";
import { UserContext } from "@/hooks/UserContext";
import useUser from "@/hooks/useUser";
import useUserInternal from "@/hooks/useUserInternal";
import "@/styles/globals.css";
import * as cookie from "cookie";
import App, { type AppContext, type AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

const dev = process.env.NODE_ENV !== "production";

type PageProps = {
  ssr_user: UserDTO | null;
  securityPage?: boolean;
  clientConfig: ClientConfigENV;
};

type AppPropsWithSSRUser = AppProps<PageProps>;

function ClientConfigHydrator(appProps: AppPropsWithSSRUser) {
  const { clientConfig } = appProps.pageProps;
  ClientConfig.basePath = clientConfig.API_BASE;
  ClientConfig.basePathSSR = clientConfig.API_BASE_SSR;
  ClientConfig.basePathRealtime = clientConfig.API_BASE_REALTIME;
  return AlmostMyApp(appProps);
}

const InnerApp = ({ Component, pageProps }: AppPropsWithSSRUser) => {
  const router = useRouter();
  const { user, refresh } = useUser();
  const realtime = useNauthRealtime();

  useEffect(() => {
    if (user) {
      realtime.connect();
      realtime.RefreshData = refresh;
    } else {
      realtime.disconnect();
    }
  }, [user, realtime, refresh]);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

const AlmostMyApp = (props: AppPropsWithSSRUser) => {
  const user = useUserInternal({ initialUser: props.pageProps.ssr_user });

  useEffect(() => {
    // console.log("First render pageProps:", props.pageProps);
  }, []);

  const PrintWarning = () => {
    console.log(
      "%cSTOP!",
      "color: white; background-color: red; font-size: 50px; font-weight: bold; padding: 20px 40px; text-align: center; display: block;",
    );

    console.log(
      "%cThis is a browser feature intended for developers ONLY. If someone told you to copy and paste something here, it is a scam and will give them access to your account.",
      "color: black; background-color: yellow; font-size: 20px; font-weight: bold; padding: 10px 20px; display: block;",
    );

    console.log(
      "%cNAuth support or other employees WILL NEVER ask you to execute any code here.",
      "color: black; background-color: yellow; font-size: 20px; font-weight: bold; padding: 10px 20px; display: block;",
    );

    console.log(
      "%cDO NOT EXECUTE ANY CODE HERE!",
      "color: white; background-color: red; font-size: 30px; font-weight: bold; padding: 10px 20px; display: block;",
    );

    console.log(
      "%cAND PLEASE HIRE ME ;)",
      "color: white; background-color: red; font-size: 30px; font-weight: bold; padding: 10px 20px; display: block;",
    );
  };

  useEffect(() => {
    if (!dev) {
      PrintWarning();
      const interval = setInterval(PrintWarning, 60_000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <>
      <UserContext.Provider value={user}>
        <NauthRealtimeProvider>
          <Head>
            <title>NAUTH</title>
            <link rel="icon" href="/favicon.svg" />
            <meta name="description" content="A secure and modern authentication platform." />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content="NAUTH" />
            <meta property="og:description" content="A secure and modern authentication platform." />
            <meta property="og:site_name" content="NAUTH" />
            <meta property="og:image" content="/email_banner.svg" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary" />
            <meta property="twitter:title" content="NAUTH" />
            <meta property="twitter:description" content="A secure and modern authentication platform." />
            <meta property="twitter:image" content="/email_banner.svg" />
          </Head>
          <InnerApp {...props} />
        </NauthRealtimeProvider>
      </UserContext.Provider>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

const MyApp: any = ClientConfigHydrator;

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);

  ///*
  if (appContext.ctx.req) {
    let finalresponse: PageProps = {
      ssr_user: null,
      securityPage: appContext.ctx.pathname.includes("/account"),
      clientConfig: {
        API_BASE: process.env.API_BASE,
        API_BASE_SSR: process.env.API_BASE_SSR,
        API_BASE_REALTIME: process.env.API_BASE_REALTIME,
      } as ClientConfigENV,
    };

    const cookies = cookie.parse((appContext.ctx.req as any)?.headers?.cookie || "");

    // Load user
    {
      const user_res = await API.SSR.User.CurrentUser({
        token: cookies.nauth ?? "",
      });

      const user = user_res?.status === "Ok" ? user_res?.response : null;
      finalresponse.ssr_user = user ?? null;

      if (
        user_res?.status === "Forbidden" &&
        (user_res?.authenticationFailureReasons as string[])?.includes("_2FARequired") &&
        !appContext.ctx.pathname.includes("/auth/2FA")
      ) {
        appContext?.ctx?.res?.writeHead(302, {
          Location: "/auth/2FA",
        });
        appContext?.ctx?.res?.end();
        return {};
      }
    }

    return {
      ...appProps,
      pageProps: {
        ...appProps.pageProps,
        ...finalresponse,
      },
    };
  } else {
    let finalresponse: PageProps = {
      ssr_user: null,
      securityPage: appContext.ctx.pathname.includes("/account"),
      clientConfig: {
        API_BASE: ClientConfig.basePath,
        API_BASE_SSR: ClientConfig.basePathSSR,
        API_BASE_REALTIME: ClientConfig.basePathRealtime,
      } as ClientConfigENV,
    };

    // Load user
    {
      const user_res = await API.Client.User.CurrentUser();

      const user = user_res?.status === "Ok" ? user_res?.response : null;
      finalresponse.ssr_user = user ?? null;
    }

    return {
      ...appProps,
      pageProps: {
        ...appProps.pageProps,
        ...finalresponse,
      },
    };
  }
  //*/
};

export default MyApp;
