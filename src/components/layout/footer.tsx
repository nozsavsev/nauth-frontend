import Link from "next/link";
import { useRouter } from "next/router";
import { FaLinkedin } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";

const Footer = () => {
  const router = useRouter();

  return (
    <footer className="flex w-screen flex-col items-center justify-center border-t border-gray-200 bg-white">
      <div
        className="relative flex w-full flex-col items-center justify-center pt-8 pb-20"
        style={{ maxWidth: router.asPath.startsWith("/admin") ? 1600 : 1200 }}
      >
        <div className="flex flex-col items-center justify-center text-lg opacity-50 sm:flex-row">
          <div className="flex">
            <Link className="mx-2" href={"/"}>
              {"Home"}
            </Link>
            <Link className="mx-2" href={"/legal"}>
              {"Legal"}
            </Link>
            <Link className="mx-2" href={"mailto:nozsavsev@gmail.com"}>
              {"Contact me"}
            </Link>
          </div>

          <div className="mx-2 h-10 bg-black sm:w-px" />

          <div className="flex">
            <Link aria-label="Go to pharma for you facebook" className="mx-2 text-3xl" href={"https://www.linkedin.com/in/ilia-nozdrachev/"}>
              <FaLinkedin />
            </Link>
            <Link aria-label="Go to pharma for you instagram" className="mx-2 text-3xl" href={"https://github.com/nozsavsev"}>
              <FiGithub />
            </Link>
          </div>
        </div>

        <div className="mt-4 flex opacity-70">{new Date().getFullYear()} © Ilia Nozdrachev</div>
      </div>
    </footer>
  );
};

export default Footer;
