import { useEffect, useState } from "react";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

import { API } from "@/API/API";
import { UserDTO } from "@/API/NauthApi_gen";
import Lottie from "lottie-react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

const statusMessages = {
  loading: "Verifying token...",
  ready: "You want to delete your account?",
  success: "Account deleted successfully.",
  error: "Error, please try again.",
  invalidToken: "Invalid or expired token.",
};

export const DeleteAccount = ({}: {}) => {
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
          setStatus(statusMessages.ready);
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
      const res = await API.Client.EmailActions.DeleteAccountApply({
        token: router.query.token.toString(),
      });
      if (res.status === "Ok") {
        setStatus(statusMessages.success);
        setTimeout(() => router.push("/"), 2000);
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
        toast.success("Account deletion cancelled.");
        router.push("/account");
      } else {
        toast.error("Error cancelling account deletion.");
      }
    }
  };

  return (
    <BrandedAuthWindow wfit>
      <div className="prose mx-4 flex flex-col items-center justify-center">
        {status === statusMessages.loading && (
          <Lottie animationData={require("../../../public/lottie/loading.json")} style={{ width: 70, height: 70 }} />
        )}
        <p className="mt-4 text-lg">{status}</p>

        {status === statusMessages.ready && (
          <>
            <h2 className="mt-4 text-red-600">
              Hi
              {", "}
              {(user?.name?.length || 0) + (user?.email?.length || 0) > 0 ? `${user?.name}` : `${user?.email}`}
            </h2>
            <h2 className="text-red-600">Your are about to delete your account</h2>
            <h3 className="text-red-600">({user?.email})</h3>
            <h2 className="text-red-600">This is the last warning</h2>

            <ul>
              <li>This action is irreversable</li>
            </ul>
            <div className="my-4 flex space-x-4">
              <Button variant="destructive" onClick={onConfirm}>
                Delete my account
              </Button>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </BrandedAuthWindow>
  );
};
