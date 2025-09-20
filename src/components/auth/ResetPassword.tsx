import { Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { API } from "@/API/API";
import useUser from "@/hooks/useUser";
import Lottie from "lottie-react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

const statusMessages = {
  loading: "Verifying token...",
  success: "Token verified. Please enter your new password.",
  error: "Error, please try again.",
  invalidToken: "Invalid or expired token.",
};

export const ResetPassword = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [userEmail, setUserEmail] = useState<string>("");
  const [status, setStatus] = useState(statusMessages.loading);
  const [emailActionId, setEmailActionId] = useState<string | undefined>();
  const [isTokenVerified, setIsTokenVerified] = useState(false);

  useEffect(() => {
    if (isLoading || isTokenVerified) {
      return;
    }

    (async () => {
      if (user == null) {
        if (router.query.token) {
          setIsTokenVerified(true);
          let res = await API.Client.EmailActions.DecodeToken({
            token: router?.query?.token?.toString(),
          });

          if (res.status == "Ok") {
            let email = res?.response?.user?.email;
            if (email) {
              setUserEmail(email);
              setEmailActionId(res.response?.id ?? "");
              setStatus(statusMessages.success);
            }
          } else {
            setStatus(statusMessages.invalidToken);
          }
        } else {
          setStatus(statusMessages.invalidToken);
        }
      }
    })();
  }, [router?.query?.token, user, isLoading, isTokenVerified]);

  const onCancel = async () => {
    if (emailActionId) {
      const res = await API.Client.EmailActions.NeutralizeEmailAction({
        id: emailActionId,
      });
      if (res.status === "Ok") {
        toast.success("Password reset cancelled.");
        router.push("/account");
      } else {
        toast.error("Error cancelling password reset.");
      }
    }
  };

  return (
    <BrandedAuthWindow>
      {status === statusMessages.success ? (
        <InitialData
          onSuccess={async (password) => {
            try {
              if (userEmail) {
                await API.Client.User.Login({
                  createUserDTO: { email: userEmail, password: password },
                });
              }
            } catch (e) {}
            router.push("/", undefined, { shallow: false });
          }}
          onCancel={onCancel}
        />
      ) : (
        <div className="my-10 mb-12 flex flex-col items-center">
          {status === statusMessages.loading && (
            <Lottie animationData={require("../../../public/lottie/loading.json")} style={{ width: 70, height: 70 }} />
          )}
          <p className="mt-4 text-lg">{status}</p>
        </div>
      )}
    </BrandedAuthWindow>
  );
};

const InitialData = ({ onSuccess, onCancel }: { onSuccess: (passowrd: string) => void; onCancel: () => void }) => {
  const passwordRegEx = /^[A-z0-9\!\#\$\%\^\&\*]{6,32}$/gm;
  const [message, setMessage] = useState<string>("");

  const router = useRouter();

  return (
    <>
      <div className="text-lg font-semibold">{message}</div>

      <Formik
        initialValues={{ password: "" }}
        onSubmit={async (values) => {
          if (router?.query?.token)
            await API.Client.EmailActions.PasswordResetApply({
              token: router?.query?.token?.toString(),
              password: values.password,
            }).then(async (res) => {
              if (res.status == "Ok") {
                setMessage("Success");
                if (onSuccess) await onSuccess(values.password);
              } else {
                // @ts-ignore
                setMessage(res.status);
              }
            });
          else setMessage("Expired service link");
        }}
        validationSchema={Yup.object().shape({
          password: Yup.string().matches(passwordRegEx, "Only: A-z 0-9 ! # $ % ^ & *").required("This field is required"),
        })}
      >
        {(props) => {
          const { values, touched, errors, dirty, isSubmitting, handleChange, handleBlur, handleSubmit, handleReset } = props;
          return (
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
            >
              <div className="w-64">
                <Label>New password</Label>
                <Input
                  id="password"
                  placeholder={"New password"}
                  type="password"
                  value={values.password.trim()}
                  onChange={(e) => {
                    e.target.value = e.target.value.trim();
                    setMessage("");
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                />
                {errors.password && touched.password && <div className="input-feedback">{errors.password}</div>}
              </div>

              <Button className="mt-4 mb-7 w-full" type="submit" disabled={isSubmitting}>
                Change password
              </Button>
              <Button className="mt-4 mb-7 w-full" type="button" variant={"secondary"} onClick={onCancel}>
                Cancel
              </Button>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
