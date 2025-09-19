import { API } from "@/API/API";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const dev = process.env.NODE_ENV === "development";

const Er_500 = ({}: any) => {
  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      async () => {
        var res = await API.Client.ServerStatus.Status();

        console.log("Checking connection", res);

        if (res.status === "Ok") {
          console.log("Connected");
          setIsConnected(true);
          setTimeout(async () => {
            router?.push(router?.query?.redirect?.toString() || "/");
          }, 1000);
        }
      },
      dev ? 500 : 4000,
    );
    return () => clearInterval(interval);
  }, [router, router?.query]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-gray-900">
      <div className="text-7xl font-bold">
        <Image loading="eager" src="/banner.svg" width={438} height={164} className="object-contain" alt="logo" />{" "}
      </div>

      <h1 className="mt-4 text-3xl font-semibold lg:text-6xl">Oops, that's our bad</h1>

      <p className="mt-2 text-lg text-gray-600 lg:text-4xl dark:text-gray-400">Our systems are down</p>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Page will automatically reload</p>
    </div>
  );
};

export default Er_500;
