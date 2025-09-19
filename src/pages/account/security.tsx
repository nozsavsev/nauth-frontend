import { API } from "@/API/API";
import { Model2FAEntryDTO, Model2FAEntrySetupDTO, SessionDTO } from "@/API/NauthApi_gen";
import AccountLayout from "@/components/account/AccountLayout";
import Activate2FA from "@/components/auth/_2FA/InitStages/Activate2FA";
import DisplayQR from "@/components/auth/_2FA/InitStages/DisplayQR";
import EnterEmailCode from "@/components/auth/_2FA/InitStages/EnterEmailCode";
import EnterName from "@/components/auth/_2FA/InitStages/EnterName";
import RemoveFactor from "@/components/auth/_2FA/RemoveFactor";
import CModal from "@/components/misc/CModal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useUser from "@/hooks/useUser";
import { ComputerIcon, PlusIcon } from "lucide-react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

function Security() {
  return (
    <AccountLayout title={"Security & sessions"}>
      <SessionManager />
      <_2FAManager />
    </AccountLayout>
  );
}
export default Security;

function _2FAManager() {
  const { user } = useUser();

  return (
    <div className="relative m-2 flex w-full flex-col items-center rounded-md border bg-white p-4 select-none xl:w-2/3">
      <div id="2FA" className="flex w-full shrink-0 items-end justify-start pb-8 text-xl font-semibold sm:justify-center">
        2FA
      </div>

      <Setup2FAPopup />

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {(user?.twoFactorAuthEntries?.length &&
          user?.twoFactorAuthEntries?.map((fae) => <_2FAFactorCard key={fae.id} factor={fae} allFactors={user.twoFactorAuthEntries ?? []} />)) || (
          <div className="col-span-full flex h-2/3 w-full items-center justify-center font-semibold text-neutral-400">You have no 2FA enabled</div>
        )}
      </div>
    </div>
  );
}

function _2FAFactorCard({ factor, allFactors }: { factor: Model2FAEntryDTO; allFactors: Model2FAEntryDTO[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {factor.name}

          <span
            className={`mx-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              factor.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {factor.isActive ? "Active" : "Inactive"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-end gap-2">
        {!factor.isActive && <Activate2FAModal factor={factor} allFactors={allFactors} />}
        <RemoveFactor factor={factor} />
      </CardFooter>
    </Card>
  );
}

function Activate2FAModal({ factor, allFactors }: { factor: Model2FAEntryDTO; allFactors: Model2FAEntryDTO[] }) {
  const modalRef = useRef<any>(null);
  const { refresh: updateData } = useUser();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    try {
      await API.Client.User.Activate2FA({
        _2faId: factor.id!,
        code: otp,
      }).then((res) => {
        if (res.status == "Ok") {
          updateData();
          modalRef.current?.closeModal();
        } else {
          setError(res.status || "Invalid code. Please try again.");
        }
      });
    } catch (e: any) {
      setError(e.message || "Invalid code. Please try again.");
    }
  };

  return (
    <CModal ref={modalRef} title={`Activate - ${factor.name}`} button={<Button variant="outline">Activate</Button>}>
      <span className="flex w-64 items-center justify-center">
        <Activate2FA factor={factor} onSuccess={handleActivate} />
      </span>
    </CModal>
  );
}

function Setup2FAPopup() {
  const { refresh: updateData } = useUser();
  const [factorName, setFactorName] = useState("");
  const [factorData, setFactorData] = useState<Model2FAEntrySetupDTO | null>(null);
  const [disableOutFrameClose, setDisableOutFrameClose] = useState<boolean>(false);

  const [stage, setStage] = useState<"nameInput" | "codeInput" | "scanQR" | "activate2FA">("nameInput");
  const modalRef = useRef<any>(null);

  const StageTitle = {
    nameInput: "Add 2FA - Enter a name",
    codeInput: "Add 2FA - Enter a code",
    scanQR: "Add 2FA - Scan the QR code",
    activate2FA: "Add 2FA - Activate 2FA",
  };

  return (
    <CModal
      ref={modalRef}
      disableOutFrameClose={disableOutFrameClose}
      title={StageTitle[stage]}
      button={
        <span className="absolute top-0 right-0 m-3 flex rounded-lg border px-2 py-1 font-semibold">
          <PlusIcon /> {"Add 2FA"}
        </span>
      }
    >
      {stage === "nameInput" && (
        <EnterName
          onSuccess={(name) => {
            setFactorName(name);
            setStage("codeInput");
            setDisableOutFrameClose(true);
            //@ts-ignore
            window.no2FAReloads = true;
            //@ts-ignore
            window.noRedirects = true;
            //@ts-ignore
            window.noLogoutRedirect = true;
          }}
        />
      )}

      {stage === "codeInput" && (
        <EnterEmailCode
          friendlyName={factorName}
          onSuccess={(factor) => {
            setFactorData(factor);
            setStage("scanQR");
          }}
        />
      )}

      {stage === "scanQR" && factorData && (
        <DisplayQR
          factor={factorData}
          onNext={() => {
            setStage("activate2FA");
          }}
        />
      )}
      {stage === "activate2FA" && factorData && (
        <Activate2FA
          factor={factorData}
          onSuccess={() => {
            if (modalRef.current) {
              modalRef.current.closeModal();
            }
            updateData();
            //@ts-ignore
            window.no2FAReloads = false;
            //@ts-ignore
            window.noRedirects = false;
            //@ts-ignore
            window.noLogoutRedirect = false;
          }}
        />
      )}
    </CModal>
  );
}

const SessionManager = observer(() => {
  const router = useRouter();
  const { user, refresh } = useUser();

  return (
    <div className="m-2 flex w-full flex-col items-center rounded-md border bg-white p-4 select-none xl:w-2/3">
      <div className="flex w-full shrink-0 items-end justify-start pb-8 text-xl font-semibold sm:justify-center">Manage sessions</div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        {user?.sessions?.map((session: SessionDTO) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      <Button
        variant={"ghost"}
        onClick={async () => {
          await API.Client.Session.RevokeAllMy();
          await refresh();
        }}
        className="mt-4 text-red-500 hover:text-red-600"
      >
        Logout from all other sessions
      </Button>
    </div>
  );
});

const SessionCard = observer(({ session }: { session: SessionDTO }) => {
  const { refresh } = useUser();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ComputerIcon />
          {session.device} {session.os}
        </CardTitle>
        <CardDescription>
          {session.browser} - {session.ipAddress}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Button
          variant={"ghost"}
          className="text-red-500 hover:text-red-600"
          onClick={async () => {
            await API.Client.Session.Revoke({ sessionId: session.id! });
            await refresh();
          }}
        >
          Revoke
        </Button>
      </CardFooter>
    </Card>
  );
});
