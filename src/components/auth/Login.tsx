// global gapi
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import * as Yup from "yup";

import { API } from "@/API/API";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCooldown } from "@/hooks/useCooldown";
import useUser from "@/hooks/useUser";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

enum LoginStages {
  Initial,
  Password,
  EmailCode,
}

export const Login = ({}: {}) => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [stage, setStage] = useState(LoginStages.Initial);
  const { user, refresh } = useUser();

  useEffect(() => {
    if (user) {
      if (router.query.rewrite == "true") {
        router.reload();
      } else router.push("/");
    }
  }, [user]);

  return (
    <BrandedAuthWindow>
      <div className="flex w-full flex-col items-center justify-center">
        {stage == LoginStages.Password || stage == LoginStages.Initial ? (
          <LoginWithPassword
            onSuccess={async () => {
              if (router.query.rewrite == "true") {
                router.reload();
              } else {
                await refresh();
              }
            }}
          />
        ) : stage == LoginStages.EmailCode ? (
          <LoginWithEmailCode
            onSuccess={async () => {
              if (router.query.rewrite == "true") {
                router.reload();
              } else {
                await refresh();
              }
            }}
          />
        ) : (
          <LoginWith2FA
            onSuccess={async () => {
              if (router.query.rewrite == "true") {
                router.reload();
              } else {
                await refresh();
              }
            }}
          />
        )}

        <div className="pt-6">
          <GoogleLogin
            type="standard"
            theme="outline"
            shape="circle"
            onSuccess={async (credentialResponse) => {
              await API.Client.User.ContinueWithGoogle({ googleAccessToken: credentialResponse.credential }).then(async (res) => {
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

        <div className="my-4 flex w-full items-center justify-center">
          <Button
            variant={"link"}
            onClick={() => setStage(stage == LoginStages.Password || stage == LoginStages.Initial ? LoginStages.EmailCode : LoginStages.Password)}
          >
            {stage == LoginStages.Password || stage == LoginStages.Initial ? "Login with Email Code" : "Login with Password"}
          </Button>
        </div>

        <div className="my-4 flex items-center justify-center">
          <Button variant={"link"} asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
          <div className="mx-2">•</div>
          <Button variant={"link"} asChild>
            <Link href={`/auth/forgotPassword?user=${email}`} className="underline">
              Forgot password
            </Link>
          </Button>
        </div>
      </div>
    </BrandedAuthWindow>
  );
};

const LoginWithPassword = ({ onSuccess }: { onSuccess: () => void }) => {
  const passwordRegEx = /^[A-z0-9\!\#\$\%\^\&\*]{6,32}$/gm;
  const [message, setMessage] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <>
      <div className="text-lg font-semibold">{message}</div>

      <Formik
        initialValues={{ password: "", email: "" }}
        onSubmit={async (values) => {
          await API.Client.User.Login({
            createUserDTO: { email: values.email, password: values.password },
          }).then((res) => {
            if (res.status == "Ok") {
              if (onSuccess) onSuccess();
            } else {
              setMessage(res.status ?? "Error");
            }
          });
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email().required("This field is required"),
          password: Yup.string().matches(passwordRegEx, "Only: A-z 0-9 ! # $ % ^ & *").required("This field is required"),
        })}
      >
        {(props) => {
          const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = props;

          return (
            <form
              className="flex w-full flex-col items-center justify-center"
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
                  value={values.email.trim()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.trim();
                    setMessage("");
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && <div className="input-feedback">{errors.email}</div>}
              </div>

              <div className="w-64">
                <Label>Password</Label>
                <div className="relative flex items-center">
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

                  <Button
                    type="button"
                    variant={"ghost"}
                    size="icon"
                    className="absolute right-0"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {!passwordVisible ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                  </Button>
                </div>

                {errors.password && touched.password && <div className="input-feedback">{errors.password}</div>}
              </div>

              <Button className="mt-5 w-64" type="submit" disabled={isSubmitting}>
                Login
              </Button>
              {/* <DisplayFormikState {...props} /> */}
            </form>
          );
        }}
      </Formik>
    </>
  );
};

const LoginWith2FA = ({ onSuccess }: { onSuccess: () => void }) => {
  const [message, setMessage] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const onLogin = async () => {
    await API.Client.User.ActivateSession({
      code: code,
    }).then((res) => {
      if (res.status == "Ok") {
        onSuccess();
      } else {
        setMessage(res.status ?? "Error");
      }
    });
  };

  return (
    <>
      <div className="text-lg font-semibold">{message}</div>
      <div className="w-64">
        <Label>2FA Code</Label>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(e) => {
            setCode(e);
          }}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button className="mt-5 w-64" type="submit" onClick={onLogin}>
        Login
      </Button>
    </>
  );
};

const LoginWithEmailCode = ({ onSuccess }: { onSuccess: () => void }) => {
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const { timeRemaining, startCooldown } = useCooldown(60);
  const [stage, setStage] = useState<"requestCode" | "enterCode">("requestCode");

  const requestCode = async (email: string) => {
    if (!email) return;
    await API.Client.EmailActions.EmailSignInRequest({
      email: email,
    }).then((res) => {
      if (res.status == "Ok") {
        setMessage("Code sent to your email");
        toast.success("Code sent to your email");
        startCooldown();
        setStage("enterCode");
      } else {
        setMessage(res.status ?? "Error");
        if (res.response?.secondsToWait) {
          try {
            startCooldown(res.response?.secondsToWait);
          } catch (e) {}
        } else {
          startCooldown();
        }
      }
    });
  };

  const onLogin = async () => {
    await API.Client.User.LoginWithCode({
      email: email,
      code: code,
    }).then((res) => {
      if (res.status == "Ok") {
        onSuccess();
      } else {
        setMessage(res.status ?? "Error");
      }
    });
  };

  return (
    <>
      {stage === "requestCode" ? (
        <>
          <div className="text-lg font-semibold">{message}</div>

          <div className="mt-4 flex w-full flex-col">
            <div className="flex flex-col items-center justify-center gap-y-4">
              <Input
                placeholder="Email"
                className="w-64"
                type="text"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                }}
              />
              <Button type="button" variant={"default"} onClick={() => requestCode(email)} className="w-fit">
                Request code
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <p>
              We've sent a code to <span className="font-semibold">{email}</span>
            </p>
          </div>

          <div className="mt-2 mb-4 flex flex-col items-center justify-center">
            <p className="h-6 font-semibold text-red-600">{message}</p>

            <div className="mt-4 mb-4 flex">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setMessage("");
                  setCode(e);
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
            <Button className="mt-5 w-64" type="submit" onClick={onLogin}>
              Login
            </Button>

            <div className="mt-4 flex items-center justify-center gap-x-2">
              <Button
                variant={"link"}
                onClick={() => {
                  setStage("requestCode");
                  setMessage("");
                }}
              >
                Back
              </Button>
              <Button variant={"link"} onClick={() => requestCode(email)} disabled={timeRemaining > 0}>
                {timeRemaining > 0 ? `Resend code in ${timeRemaining}s` : "Resend code"}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
