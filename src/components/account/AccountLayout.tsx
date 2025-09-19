import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useRef } from "react";
import { BsLock } from "react-icons/bs";
import { FaRegAddressCard } from "react-icons/fa";

const AccountLayout = ({ children, title }: { children: ReactNode; title: string }) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (tabsRef.current && router.pathname) {
      if (router.pathname.includes("personal-info")) tabsRef.current.scrollTo(0, 0);

      if (router.pathname.includes("security")) tabsRef.current.scrollTo(120, 0);

      if (router.pathname.includes("email-actions")) tabsRef.current.scrollTo(240, 0);
    }
  }, [tabsRef, router.pathname]);

  return (
    <div className="mb-8 flex min-h-screen w-full items-start justify-center">
      <div className="flex h-auto w-full max-w-7xl flex-col pt-8 md:flex-row">
        <Head>
          <title>{`${title && title + " | "} NAUTH`}</title>
        </Head>

        <div ref={tabsRef} className="scrollHide flex shrink-0 space-x-4 overflow-x-auto px-2 md:flex-col md:space-x-0">
          <TabComponent
            href="/account/personal-info"
            title={
              <div className="flex items-center">
                <FaRegAddressCard width={25} height={25} className="mx-2" />
                Personal info
              </div>
            }
          />
          <TabComponent
            href="/account/security"
            title={
              <div className="flex items-center">
                <BsLock width={25} height={25} className="mx-2" />
                Security & sessions
              </div>
            }
          />
          <TabComponent
            href="/account/email-actions"
            title={
              <div className="flex items-center">
                <FaRegAddressCard width={25} height={25} className="mx-2" />
                Email Actions
              </div>
            }
          />
        </div>
        <div className="scrollHide flex h-full w-full flex-col items-center overflow-y-auto px-4">{children || null}</div>
      </div>
    </div>
  );
};
export default AccountLayout;

const TabComponent = ({ href, title }: { href: string; title: ReactNode }) => {
  const router = useRouter();

  return (
    <Link
      className={`bg-neutral-100 ${
        router.asPath.includes(href.substring(href.lastIndexOf("/")).toLowerCase()) && "bg-white font-semibold text-black saturate-50"
      } mb-4 shrink-0 rounded-md border border-neutral-300 px-4 py-2`}
      href={href}
    >
      {title}
    </Link>
  );
};
