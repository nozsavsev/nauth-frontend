import { API } from "@/API/API";
import { Model2FAEntrySetupDTO } from "@/API/NauthApi_gen";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCooldown } from "@/hooks/useCooldown";
import useUser from "@/hooks/useUser";
import { ExternalLink, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EnterEmailCode({ onSuccess, friendlyName }: { onSuccess: (factor: Model2FAEntrySetupDTO) => void; friendlyName: string }) {
  const { user } = useUser();

  const [error, setError] = useState("");
  const { timeRemaining, startCooldown } = useCooldown(60);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((user?.twoFactorAuthEntries?.length ?? 0) == 0) {
      API.Client.EmailActions.EmailCodeRequest().then((res) => {
        if (res.status == "Ok") {
          setLoading(false);
        }
      });
    }
  }, [user?.twoFactorAuthEntries]);

  return (
    <div>
      {loading ? (
        <div className="mx-20 my-20 flex items-center justify-center text-xl">
          <LoaderCircleIcon className="mr-2 h-7 w-7 animate-spin" />
          Verifying, please wait...
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="flex shrink-0">
              Code have been sent to
              <Link
                target="_blank"
                className="ml-1 flex items-center justify-center font-semibold text-sky-900"
                aria-label="Go to email provider"
                href={`https://${user?.email?.split("@")[1]}`}
              >
                {user?.email} <ExternalLink className="h-4" />
              </Link>
            </p>
            {(user?.twoFactorAuthEntries?.length ?? 0) > 0 && (
              <p>
                Or use code from any of your <span className="font-semibold">Authenticators app.</span>
              </p>
            )}
          </div>

          <div className="mt-2 mb-4 flex flex-col items-center justify-center">
            <p className="h-6 font-semibold text-red-600">{error}</p>

            <div className="mt-4 mb-4 flex">
              <InputOTP
                maxLength={6}
                onChange={(e: string) => {
                  setError("");

                  if (e?.length == 6) {
                    setLoading(true);
                    API.Client.User.Setup2FA({
                      code: e,
                      name: friendlyName,
                    }).then((res) => {
                      if (res.status == "Ok") {
                        onSuccess(res.response!);
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

            <button
              disabled={timeRemaining > 0}
              className={`font-semibold text-black transition-all disabled:text-neutral-700 disabled:opacity-50`}
              onClick={() => {
                API.Client.EmailActions.EmailCodeRequest().then((res) => {
                  if (res.status == "Ok") {
                    startCooldown();
                  }
                });
              }}
            >
              {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Resend email code"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
