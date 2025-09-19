import { useState } from "react";
import { toast } from "react-toastify";
import AccountLayout from "../../components/account/AccountLayout";
import { AvatarUploader } from "../../components/account/AvatarUploader";
import EditLabel from "../../components/misc/EditLabel";

import { API } from "@/API/API";
import { Button } from "@/components/ui/button";
import { useCooldown } from "@/hooks/useCooldown";
import useUser from "@/hooks/useUser";

function PersonalInfo() {
  const { user } = useUser();

  return (
    <AccountLayout title={"Personal info"}>
      <div className="flex w-full flex-col justify-center space-y-6 2xl:w-5/6">
        <AvatarUploader />
        <PropEditor
          regexStr={"^[A-z0-9А-яא-ת`\\-' ]{1,45}$"}
          name={"First name"}
          InitialValue={user?.name ?? ""}
          onSubmit={async (newValue) => {
            let res = await API.Client.User.UpdateUserName({
              updateNameDTO: {
                name: newValue,
              },
            });

            if (res.status == "Ok") {
              toast.success("Updated successfully");
            } else toast.error(res.status);
          }}
          description={"Used to personalize your experience."}
          regexDesk={"Numbers, letters, dashes, spaces"}
        />

        <PropEditor
          isEmail
          tag={user?.isEmailVerified ? "Verified" : "Verification needed"}
          tagType={user?.isEmailVerified ? "success" : "warning"}
          regexStr={"^((?!\\.)[\\w-_.]*[^.])(@\\w+)(\\.\\w+(\\.\\w+)?[^.\\W])$"}
          name={"Email"}
          regexDesk={"We will send you an email to verify your new email address"}
          InitialValue={user?.email ?? ""}
          onSubmit={async (newValue) => {
            let res = await API.Client.EmailActions.ChangeEmailRequest({
              newEmail: newValue,
            });

            if (res.response?.sentSuccessfully === true) {
              toast.success("Updated successfully");
            } else toast.error(res.status);
          }}
        />

        {!user?.isEmailVerified && <VerifyEmailButton />}

        <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border bg-white">
          <div className="flex w-full items-start justify-between p-4">
            <div className="flex justify-center text-2xl font-semibold">{"Change password"}</div>
            <ResetPasswordButton email={user?.email ?? ""} />
          </div>

          <div className="flex w-full shrink-0 flex-col items-center justify-between border-t bg-neutral-50 px-4 py-2 lg:flex-row">
            <div>{"Press button to receive an email"}</div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border bg-white">
          <div className="flex w-full items-start justify-between p-4">
            <div className="flex items-center justify-center text-2xl font-semibold">{"Delete my account"}</div>
            <DeleteMyAccountButton />
          </div>

          <div className="flex w-full shrink-0 flex-col items-center justify-between border-t bg-neutral-50 px-4 py-2 lg:flex-row">
            <div className="my-2">{"We will send you an email to verify request"}.</div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}

const VerifyEmailButton = () => {
  const { timeRemaining, startCooldown } = useCooldown(60);

  return (
    <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border bg-white">
      <div className="flex flex-col items-start justify-start p-4">
        <div className="flex justify-center text-2xl font-semibold">{"Verify your email"}</div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center justify-between border-t bg-neutral-50 px-4 py-2 lg:flex-row">
        <div>{"Press button to receive an email"}</div>
        <Button
          disabled={timeRemaining > 0}
          onClick={async () => {
            const res = await API.Client.EmailActions.VerifyEmailRequest();
            if (res.status === "Ok") {
              toast.success("Verification email sent");
              startCooldown();
            } else {
              toast.error(res.status);
            }
          }}
        >
          {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Send verification email"}
        </Button>
      </div>
    </div>
  );
};

const DeleteMyAccountButton = ({}: {}) => {
  const { timeRemaining, startCooldown } = useCooldown(60);

  return (
    <Button
      variant={"destructive"}
      disabled={timeRemaining > 0}
      onClick={() => {
        API.Client.EmailActions.DeleteAccountRequest().then((res: any) => {
          if (res.status == "Ok") {
            toast.success("Email sent successfully");
            startCooldown();
          } else {
            toast.warning(res.status);
          }
        });
      }}
    >
      {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Delete my account"}
    </Button>
  );
};

const ResetPasswordButton = ({ email }: { email: string }) => {
  const { timeRemaining, startCooldown } = useCooldown(60);

  return (
    <Button
      variant={"default"}
      disabled={timeRemaining > 0}
      onClick={() => {
        API.Client.EmailActions.PasswordResetRequest({
          email: email,
        }).then((res: any) => {
          if (res.status == "Ok") {
            toast.success("Email sent successfully");
            startCooldown();
          } else {
            toast.warning(res.status);
          }
        });
      }}
    >
      {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Send an email"}
    </Button>
  );
};

export default PersonalInfo;

const PropEditor = ({
  name,
  InitialValue,
  regexStr,
  description,
  onSubmit,
  regexDesk,
  tag,
  tagType,
  isEmail,
}: {
  name: string;
  InitialValue: string;
  regexStr: string;
  description?: string;
  onSubmit: (newValue: string) => void;
  regexDesk?: string;
  tag?: any;
  tagType?: "warning" | "success";
  isEmail?: boolean;
}) => {
  const [value, setValue] = useState(InitialValue);
  const { timeRemaining, startCooldown } = useCooldown(60);

  return (
    <div className="flex w-full flex-col items-start overflow-hidden rounded-lg border bg-white">
      <div className="flex w-full flex-col items-start justify-start p-4">
        <div className="flex w-full items-center justify-between text-2xl font-semibold">
          <div className="flex items-center justify-center">
            {name}
            <div
              className={`mx-4 ${!tag && "hidden"} ${
                tagType === "success" ? "bg-green-600" : "bg-amber-600"
              } flex items-center justify-center rounded-xl px-3 py-0.5 text-sm font-semibold text-white`}
            >
              {tag}
            </div>
          </div>
          <Button
            className="block lg:hidden"
            disabled={timeRemaining > 0 || value === InitialValue}
            onClick={() => {
              if (value && new RegExp(regexStr).exec(value)) {
                onSubmit(value.trim());
                if (isEmail) {
                  toast.success("Verification email sent to new address.");
                  startCooldown();
                }
              } else {
                toast.error("Please check your " + name.toLowerCase());
              }
            }}
          >
            {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Save"}
          </Button>
        </div>

        <div className="my-2 text-lg">{description}</div>

        <EditLabel regexStr={regexStr} name={name} value={value} onChange={setValue} />
      </div>

      <div className="flex w-full shrink-0 flex-col items-center justify-between border-t bg-neutral-50 px-4 py-2 lg:flex-row">
        <div>{regexDesk}</div>
        <Button
          className="hidden lg:block"
          disabled={timeRemaining > 0 || value === InitialValue}
          onClick={() => {
            if (value && new RegExp(regexStr).exec(value)) {
              onSubmit(value.trim());
              if (isEmail) {
                toast.success("Verification email sent to new address.");
                startCooldown();
              }
            } else {
              toast.error("Please check your " + name.toLowerCase());
            }
          }}
        >
          {timeRemaining > 0 ? `Please wait ${timeRemaining}s` : "Save"}
        </Button>
      </div>
    </div>
  );
};
