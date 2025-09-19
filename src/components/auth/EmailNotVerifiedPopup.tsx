import { useState } from "react";

import useUser from "@/hooks/useUser";
import Link from "next/link";
import { useRouter } from "next/router";
import { CgClose } from "react-icons/cg";

export const EmailNotVerifiedPopup = () => {
  const { user } = useUser();

  const [closed, setClosed] = useState<boolean>(false);
  const router = useRouter();

  if (user && !user?.isEmailVerified && !closed && router.pathname !== "/auth/verifyEmailRequest")
    return (
      <div className="fixed bottom-0 z-[1000] h-20 w-screen p-4">
        <div className="flex h-full w-full flex-1 items-center justify-between rounded-lg bg-amber-300 px-4">
          Please verify your email
          <div className="flex">
            <Link href="/auth/verifyEmailRequest" className="mx-2 rounded-lg border bg-white px-6 py-1">
              Verify
            </Link>

            <button
              onClick={() => {
                setClosed(true);
              }}
              className="relative top-0 right-0"
            >
              <CgClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
};
