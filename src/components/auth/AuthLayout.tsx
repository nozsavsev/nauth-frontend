import { GoogleOAuthProvider } from "@react-oauth/google";
import Head from "next/head";
import AlreadyAuthenticated from "./AlreadyAuthenticated";

const AuthLayout = ({ children, title }: { children: any; title: string }) => {
  return (
    <GoogleOAuthProvider clientId="27550983296-dcl4c3pafiicjt79gudl4ql81imu37lr.apps.googleusercontent.com">
      <div className="flex h-screen w-full items-center justify-center">
        <AlreadyAuthenticated />

        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <title>{title || "NAUTH"}</title>
        </Head>

        <div className="pointer-events-none absolute top-0 bottom-0 z-0 h-screen w-screen overflow-hidden bg-black bg-white select-none">
          {/* <Image
          width={1920}
          height={1080}
          src="/loginBackdrop.svg"
          style={{ height: "100vh", width: "100vw" }}
          className="pointer-events-none z-0 select-none object-cover opacity-50"
          alt="logo"
        /> */}
        </div>

        {children}
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthLayout;
