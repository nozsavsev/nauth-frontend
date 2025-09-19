import { API } from "@/API/API";
import { Model2FAEntryDTO } from "@/API/NauthApi_gen";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCooldown } from "@/hooks/useCooldown";
import useUser from "@/hooks/useUser";
import { LoaderCircleIcon, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import CModal from "../../misc/CModal";

export default function RemoveFactor({ factor }: { factor: Model2FAEntryDTO }) {
  const [error, setError] = useState("");
  const { timeRemaining, startCooldown } = useCooldown(60);

  const [loading, setLoading] = useState(false);

  const { refresh } = useUser();
  const modalRef = useRef(null);
  return (
    <CModal
      ref={modalRef}
      button={
        <Button variant="ghost" className="text-red-500 hover:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      }
      title={`Remove ${factor.name}`}
    >
      <div>
        {loading ? (
          <div className="mx-20 my-20 flex items-center justify-center text-xl">
            <LoaderCircleIcon className="mr-2 h-7 w-7 animate-spin" />
            Verifying, please wait...
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
                      API.Client.User.Delete2FAWithCode({
                        code: e,
                        _2faId: factor.id!,
                      }).then((res) => {
                        console.log(res);
                        if (res.status == "Ok") {
                          refresh();
                          //@ts-ignore
                          modalRef.current?.closeModal();
                          setLoading(false);
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
                    } else {
                      setError("please wait");
                      setLoading(false);
                    }
                  });
                }}
              >
                {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Use Email Code"}
              </button>
            </div>
          </>
        )}
      </div>
    </CModal>
  );
}
