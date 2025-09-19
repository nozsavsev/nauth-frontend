import { API } from "@/API/API";
import { Button } from "@/components/ui/button";
import { useCooldown } from "@/hooks/useCooldown";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

export const VerifyEmailRequest = () => {
  const { user, refresh } = useUser();

  const router = useRouter();
  const { timeRemaining, startCooldown } = useCooldown(60);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (user?.isEmailVerified) {
      toast.success("Email verified");
      router.push("/");
    }
  }, [user]);

  return (
    <BrandedAuthWindow>
      <div className="mx-2 text-center">Once you receive an email, please click on the link to verify your email address.</div>

      <div className="font-semibold">{message}</div>

      <Button
        className="mt-4 mb-2 w-full"
        onClick={async () => {
          await API.Client.EmailActions.VerifyEmailRequest().then(async (res) => {
            if (res.status == "Ok") {
              toast.success("Verification email sent");
              startCooldown();
            } else {
              setMessage(res.status ?? "");
            }
          });
        }}
        disabled={timeRemaining > 0}
      >
        {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Send email"}
      </Button>
    </BrandedAuthWindow>
  );
};
