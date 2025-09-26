import { API } from "@/API/API";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import useUser from "@/hooks/useUser";
import { LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import cookie from "react-cookies";
import { BrandedAuthWindow } from "../common/BrandedAuthWindow";

export const Verify2FA = ({}: {}) => {
  const router = useRouter();

  const { user, refresh } = useUser();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (typeof window !== "undefined") {
        //@ts-ignore
        window.no2FAReloads = true;
      }

      cookie.save("2faStatusChanged", "true", { path: "/" });

      router.push(router.query?.redirect?.toString() || "/");
    }
  }, [router.query, user]);

  return (
    <BrandedAuthWindow>
      <div>
        {loading ? (
          <div className="mx-20 my-20 flex shrink-0 items-center justify-center text-xl">
            <LoaderCircleIcon className="mr-2 h-7 w-7 animate-spin" />
            Verifying...
          </div>
        ) : (
          <>
            <div className="text-center">
              <p>
                Use code from any of your <span className="font-semibold">Authenticators app.</span>
              </p>
            </div>

            <div className="mt-2 mb-4 flex flex-col items-center justify-center">
              <p className="h-6 font-semibold text-red-600">{error}</p>

              <div className="mt-4 mb-4 flex">
                <InputOTP
                  maxLength={6}
                  onChange={(e) => {
                    setError("");

                    if (e.length == 6) {
                      setLoading(true);
                      API.Client.User.ActivateSession({
                        code: e,
                      }).then((res) => {
                        if (res.status == "Ok") {
                          refresh();
                        } else {
                          setError("Invalid code");
                          setLoading(false);
                        }
                      });
                    }
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <div />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col items-center justify-center">
        <Link href="/auth/2FA/recovery" className="pb-4 text-center">
          <p className="font-semibold text-black">I lost my authenticator</p>
        </Link>

        <Link
          href="/auth/login"
          onClick={async () => {
            await API.Client.Session.RevokeCurrentNo2FA();
          }}
          className="pb-4 text-center"
        >
          <p className="font-semibold text-black">Log out</p>
        </Link>
      </div>
    </BrandedAuthWindow>
  );
};
