import { Model2FAEntrySetupDTO } from "@/API/NauthApi_gen";
import useUser from "@/hooks/useUser";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { QRCode } from "react-qrcode-logo";

export default function DisplayQR({ factor, onNext }: { onNext: () => void; factor: Model2FAEntrySetupDTO }) {
  const { user, refresh } = useUser();
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className="mx-2 my-2 flex flex-col items-center justify-center">
        <QRCode
          logoImage="/logos/security.svg"
          logoHeight={64}
          logoWidth={64}
          logoPadding={1}
          logoPaddingStyle="circle"
          size={256}
          qrStyle="fluid"
          quietZone={0}
          eyeRadius={15}
          value={factor.qrCodeUrl || ""}
        />

        <div className="my-4 flex items-center justify-center rounded-lg border">
          <div className="px-4 py-2 font-mono text-lg">
            <div>
              {factor._2fASecret
                ?.match(/.{1,4}/g)
                ?.slice(0, 4)
                .map((chunk, index) => (
                  <Fragment key={index}>
                    <span>{chunk}</span>
                    {index < 3 && <span className="select-none">-</span>}
                  </Fragment>
                ))}
            </div>
            <div>
              {factor._2fASecret
                ?.match(/.{1,4}/g)
                ?.slice(4, 8)
                .map((chunk, index) => (
                  <Fragment key={index}>
                    <span>{chunk}</span>
                    {index < 3 && <span className="select-none">-</span>}
                  </Fragment>
                ))}
            </div>
          </div>
          <button
            className="flex h-full items-center justify-center rounded-r-lg border-l px-4 py-2 font-semibold"
            onClick={() => {
              navigator.clipboard.writeText(factor._2fASecret || "");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied!" : <CopyIcon />}
          </button>
        </div>

        <p className="mb-3">
          Please save your recovery codes! <br /> As this is the only way to reset 2FA <br /> if you lose access to your device.{" "}
        </p>

        <button
          className="mx-2 mb-4 flex shrink-0 items-center justify-center rounded-lg border px-4 py-2 font-semibold"
          onClick={async () => {
            await refresh();

            const data = `These codes are meant to be used when you lose access to your 2FA device.\n${factor.recoveryCode}`;
            const blob = new Blob([data], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `${user?.email || "your"} recovery codes for NAUTH.txt`;
            document.body.appendChild(a);
            a.click();

            URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }}
        >
          <DownloadIcon className="mx-2" /> Download recovery codes
        </button>

        <button
          className="mx-2 flex shrink-0 items-center justify-center rounded-lg border px-4 py-2 font-semibold"
          onClick={async () => {
            onNext();
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
