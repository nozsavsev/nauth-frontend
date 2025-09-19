import { Formik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";

import { API } from "@/API/API";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCooldown } from "@/hooks/useCooldown";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

export const ForgotPassword = () => {
  const router = useRouter();

  return (
    <BrandedAuthWindow>
      <InitialData
        onSuccess={() => {
          // router.push('/', undefined, { shallow: false });
        }}
      />
    </BrandedAuthWindow>
  );
};

const InitialData = ({ onSuccess }: { onSuccess: () => void }) => {
  const [message, setMessage] = useState<string>("");

  const router = useRouter();

  const { timeRemaining, startCooldown } = useCooldown(60);

  return (
    <>
      <div className="text-lg font-semibold">{message}</div>

      <Formik
        initialValues={{
          email: (router.query.user as string) || "",
        }}
        onSubmit={async (values) => {
          await API.Client.EmailActions.PasswordResetRequest({
            email: values.email,
          }).then(async (res: any) => {
            if (res.status == "Ok") {
              setMessage("");
              toast.success("Password reset email sent");
              startCooldown();
              onSuccess && onSuccess();
            } else {
              setMessage(res.status);
              startCooldown();
            }
          });
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email().required("Your email is required"),
        })}
      >
        {(props) => {
          const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = props;

          return (
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
            >
              <div className="w-64">
                <Label>Email</Label>
                <Input
                  id="email"
                  placeholder="Email"
                  type="text"
                  value={values.email?.trim() || ""}
                  onChange={(e) => {
                    e.target.value = e.target.value.trim();
                    setMessage("");
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && <div className="input-feedback">{errors.email}</div>}
              </div>
              <Button className="mt-4 mb-7 w-full" type="submit" disabled={isSubmitting || timeRemaining > 0}>
                {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Reset pasword"}
              </Button>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
