import { API } from "@/API/API";
import { Model2FAEntrySetupDTO } from "@/API/NauthApi_gen/models";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { BrandedAuthWindow } from "../common/BrandedAuthWindow";
import Activate2FA from "./InitStages/Activate2FA";
import DisplayQR from "./InitStages/DisplayQR";

export default function Recover2FA() {
  const router = useRouter();
  const [factor, setFactor] = useState<Model2FAEntrySetupDTO | null>(null);

  const [stage, setStage] = useState<"codeInput" | "newQR" | "activate2FA">("codeInput");

  return (
    <BrandedAuthWindow>
      {stage === "codeInput" && (
        <CodeInput
          onSuccess={(factor) => {
            //@ts-ignore
            window.onbeforeunload = function () {
              return "Are you sure you want to leave?";
            };

            setFactor(factor);
            setStage("newQR");
          }}
        />
      )}
      {stage === "newQR" && factor && (
        <DisplayQR
          factor={factor}
          onNext={() => {
            setStage("activate2FA");
          }}
        />
      )}

      {stage === "activate2FA" && factor && (
        <Activate2FA
          factor={factor}
          onSuccess={() => {
            //@ts-ignore
            window.onbeforeunload = null;
            router.push("/");
          }}
        />
      )}
    </BrandedAuthWindow>
  );
}

function CodeInput({ onSuccess }: { onSuccess: (factor: Model2FAEntrySetupDTO) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {loading ? (
        <div className="mx-20 my-20 flex shrink-0 items-center justify-center text-xl">
          <LoaderCircleIcon className="mr-2 h-7 w-7 animate-spin" />
          Verifying...
        </div>
      ) : (
        <>
          <div className="mt-2 flex w-full flex-row items-start rounded-md p-4">
            <div className="flex-grow">
              <ul className="list-disc space-y-1 pl-4 text-sm text-black">
                <li>Use the recovery code for the authenticator you lost.</li>
                <li>
                  It should look like this: <strong>F379A101</strong>
                </li>
                <li>
                  Usually in a file named:
                  <br />
                  <code className="rounded-sm bg-neutral-200 px-2 py-1 text-xs">recovery codes NAUTH.txt</code>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="h-6 font-semibold text-red-600">{error}</p>

            <div className="mt-4 mb-2 flex">
              <InputOTP
                maxLength={8}
                value={value}
                onChange={(e) => {
                  setError("");

                  e = e.toUpperCase().trim();

                  setValue(e);

                  if (e.length == 8) {
                    setLoading(true);
                    API.Client.User.Delete2FAWithRecoveryCode({
                      code: e,
                    }).then(async (res) => {
                      if (res.status == "Ok") {
                        setLoading(false);
                        onSuccess(res.response!);
                      } else {
                        setError("Invalid code");
                        setLoading(false);
                        setValue("");
                      }
                    });
                  }
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <div />
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                  <InputOTPSlot index={6} />
                  <InputOTPSlot index={7} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
