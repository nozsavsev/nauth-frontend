import useUser from "@/hooks/useUser";
import Link from "next/link";

export default function AlreadyAuthenticated() {
  const { user } = useUser();

  if (user)
    return (
      <div className="absolute top-0 z-50 flex w-full justify-between px-4 py-3">
        <div className="flex text-neutral-800">
          Logged in as:
          <div className="font-semibold text-neutral-800 ltr:ml-2 rtl:mr-2">{user?.name ?? user?.email}</div>.
        </div>

        <Link className="text-neutral-800" href="/">
          Go home
        </Link>
      </div>
    );
  else return <div />;
}
