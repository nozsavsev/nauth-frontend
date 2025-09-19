import Lottie from "lottie-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { API } from "@/API/API";
import { UserDTO } from "@/API/NauthApi_gen";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

const statusMessages = {
  loading: "Verifying token...",
  ready: "You want to change your email to",
  success: "Email changed successfully!",
  error: "Error, please try again.",
  invalidToken: "Invalid or expired token.",
};

export const ChangeEmail = ({}: {}) => {
  const router = useRouter();
  const [status, setStatus] = useState(statusMessages.loading);
  const [user, setUser] = useState<UserDTO | undefined>();
  const [emailActionId, setEmailActionId] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      if (router.query.token) {
        const res = await API.Client.EmailActions.DecodeToken({
          token: router.query.token.toString(),
        });

        if (res.status === "Ok" && res.response) {
          setUser(res.response.user);
          setEmailActionId(res.response.id ?? "");
          setStatus(statusMessages.ready + res.response.data + "?");
        } else {
          setStatus(statusMessages.invalidToken);
        }
      } else {
        setStatus(statusMessages.invalidToken);
      }
    })();
  }, [router.query.token]);

  const onConfirm = async () => {
    if (router.query.token) {
      const res = await API.Client.EmailActions.ChangeEmailApply({
        token: router.query.token.toString(),
      });
      if (res.status === "Ok") {
        setStatus(statusMessages.success);
        setTimeout(() => router.push("/account"), 2000);
      } else {
        setStatus(statusMessages.error);
      }
    }
  };

  const onCancel = async () => {
    if (emailActionId) {
      const res = await API.Client.EmailActions.NeutralizeEmailAction({
        id: emailActionId,
      });
      if (res.status === "Ok") {
        toast.success("Email change cancelled.");
        router.push("/account");
      } else {
        toast.error("Error cancelling email change.");
      }
    }
  };

  return (
    <BrandedAuthWindow>
      <div className="my-10 mb-12 flex flex-col items-center">
        {status === statusMessages.loading && (
          <Lottie animationData={require("../../../public/lottie/loading.json")} style={{ width: 70, height: 70 }} />
        )}
        <p className="mt-4 text-lg">{status}</p>
        {status === statusMessages.ready && (
          <div className="mt-4 flex space-x-4">
            <Button onClick={onConfirm}>Confirm</Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </BrandedAuthWindow>
  );
};
