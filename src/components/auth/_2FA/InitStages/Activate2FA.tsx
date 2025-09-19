import { API } from "@/API/API";
import { Model2FAEntrySetupDTO } from "@/API/NauthApi_gen";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";

export default function Activate2FA({ onSuccess, factor }: { onSuccess: () => void; factor: Model2FAEntrySetupDTO }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {loading ? (
        <div className="mx-20 my-20 flex items-center justify-center text-xl">
          <LoaderCircleIcon className="mr-2 h-7 w-7 animate-spin" />
          Activating, please wait...
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="flex shrink-0">Please enter the code from your authenticator app to activate it.</p>
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
                    API.Client.User.Activate2FA({
                      code: e,
                      _2faId: factor.id!,
                    }).then(async (res) => {
                      if (res.status == "Ok") {
                        onSuccess();

                        await API.Client.User.ActivateSession({
                          code: e,
                        });
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
  );
}
