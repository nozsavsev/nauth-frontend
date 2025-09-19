import Image from "next/image";

export const BrandedAuthWindow = ({ children, wfit }: { children: any; wfit?: boolean }) => {
  return (
    <div
      className={`relative z-10 m-5 rounded-lg border border-neutral-300 bg-white ${
        wfit ? "lg:w-fit" : "lg:w-80"
      } flex flex-col items-center justify-center`}
    >
      <div className="relative z-10 mt-5 flex w-full flex-col items-center px-2">
        <Image loading="lazy" src="/banner.svg" width={438} height={164} className="object-contain" alt="logo" />

        {children}
      </div>
    </div>
  );
};
