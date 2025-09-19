import { API } from "@/API/API";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUser from "@/hooks/useUser";
import { GoogleLogin } from "@react-oauth/google";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import * as Yup from "yup";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

export const Register = () => {
  const router = useRouter();

  const { user, refresh } = useUser();

  return (
    <BrandedAuthWindow>
      <InitialData
        onSuccess={async () => {
          await refresh();

          router.push(router.query?.redirect?.toString() || `/`, undefined, {
            shallow: false,
          });
        }}
      />
      <div className="pt-6">
        <GoogleLogin
          type="standard"
          theme="outline"
          shape="circle"
          onSuccess={async (credentialResponse) => {
            await API.Client.User.ContinueWithGoogle({
              googleAccessToken: credentialResponse.credential,
            }).then(async (res) => {
              console.log(res);
              if (res.status == "Ok") {
                await refresh();
                if (router.query.rewrite == "true") {
                  router.reload();
                } else await refresh();
                router.push(router.query?.redirect?.toString() || `/`, undefined, {
                  shallow: false,
                });
              }
            });
          }}
          onError={() => {}}
        />
      </div>

      <p className="m-4 text-center text-sm text-neutral-600">
        By clicking Register you agree to our{" "}
        <Link href="https://nozsa.com/legal/" target="_blank" aria-label="go to legal agreements" className="underline">
          legal agreements
        </Link>
      </p>

      <Button variant={"link"} asChild>
        <Link href="/auth/login">Already have an account?</Link>
      </Button>
    </BrandedAuthWindow>
  );
};

const InitialData = ({ onSuccess }: { onSuccess: () => void }) => {
  const passwordRegEx = /^[A-z0-9\!\#\$\%\^\&\*]{6,32}$/gm;
  const [message, setMessage] = useState<string>("");
  const { user, refresh } = useUser();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <>
      <div className="text-lg font-semibold">{message}</div>

      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          await API.Client.User.Register({
            createUserDTO: { email: values.email, password: values.password },
          }).then(async (res) => {
            if (res.status == "Ok") {
              setMessage("Success");
              if (onSuccess) onSuccess();
            } else {
              if (res.status === "EmailNotAvailable") {
                await API.Client.User.Login({
                  createUserDTO: {
                    email: values.email,
                    password: values.password,
                  },
                }).then((res) => {
                  if (res.status == "Ok") {
                    if (onSuccess) onSuccess();
                  } else {
                    setMessage("InvalidPassWithEmail");
                  }
                });
              } else {
                // @ts-ignore
                setMessage(res.error);
              }
            }
          });
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email("Invalid email address").required("This field is required"),
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
                <Input
                  id="email"
                  placeholder={"Email"}
                  type="text"
                  value={values.email.trim()}
                  onChange={(e) => {
                    e.target.value = e.target.value.trim();
                    setMessage("");
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && <div className="input-feedback">{errors.email}</div>}
              </div>

              <div className="relative mt-2 flex w-64 items-center">
                <Input
                  id="password"
                  placeholder="Password"
                  type={passwordVisible ? "text" : "password"}
                  value={values.password.trim()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.trim();
                    setMessage("");
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                  className="pr-10"
                />

                <Button type="button" variant={"ghost"} size="icon" className="absolute right-0" onClick={() => setPasswordVisible(!passwordVisible)}>
                  {!passwordVisible ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                </Button>
              </div>

              <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>
                {"Register"}
              </Button>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
