// components/layout.js

import { useRouter } from "next/router";
import Footer from "./footer";
import Navbar from "./navbar";

const Layout = ({ children }: any) => {
  const router = useRouter();

  const noNav = () => {
    return (
      ["/test", "/_error", "/500", "/auth", "/403", "/404", "/select-branch"].filter((x) => router?.pathname?.startsWith(x)).length != 0 ||
      router?.pathname?.endsWith("_preview")
    );
  };

  const noFoot = () => {
    return ["/test"].filter((x) => router?.pathname?.startsWith(x)).length != 0 || router?.pathname?.endsWith("_preview");
  };

  return (
    <>
      {process.env.NODE_ENV == "development" && (
        <div className="fixed top-10 left-10 z-[60]">
          <div className="block sm:hidden">sm</div>
          <div className="hidden sm:block md:hidden">md</div>
          <div className="hidden md:block lg:hidden">lg</div>
          <div className="hidden lg:block xl:hidden">xl</div>
          <div className="hidden xl:block">2xl</div>
        </div>
      )}

      {router.asPath.endsWith("_preview") ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen flex-col">
          {!noNav() && <Navbar />}
          <div className={`m-0 w-full shrink-0 flex-grow p-0 ${noNav() ? "flex items-center justify-center" : ""}`}>
            <div
              className={`${!noNav() ? "w-full" : ""} mx-auto flex flex-col`}
              style={
                noNav() && noFoot()
                  ? { minHeight: "100vh" }
                  : {
                      maxWidth: router.asPath.startsWith("/admin") && !router.asPath.endsWith("preview") ? 1600 : 1200,
                      minHeight: "calc(100vh - 64px)",
                    }
              }
            >
              {children}
            </div>
          </div>
          {!noFoot() && <Footer />}
        </div>
      )}
    </>
  );
};

export default Layout;
