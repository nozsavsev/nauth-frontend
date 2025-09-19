import { API } from "@/API/API";
import { ServiceDTO } from "@/API/NauthApi_gen";
import usePermissions from "@/hooks/usePermissions";
import useService from "@/hooks/useService";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function EditService({ _service }: { _service: ServiceDTO }) {
  const { service, refresh } = useService({ initialService: _service });
  const { permissions } = usePermissions({ initialPermissions: service?.permissions ?? null });

  function getPermissionName(permissionKey: string) {
    return permissions.find((p) => p.key === permissionKey || p.id === permissionKey)?.name?.replaceAll("Pr", "") ?? "";
  }

  const [localService, setLocalService] = useState<ServiceDTO | null>(_service);

  useEffect(() => {
    setLocalService(service);
  }, [service]);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-md flex-col items-start justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <Input value={localService?.name ?? ""} onChange={(e) => setLocalService({ ...localService, name: e.target.value })} />
          <Button
            disabled={service?.id === "0"}
            onClick={async () => {
              if (localService) {
                const res = await API.Client.Service.Update({ id: localService.id!, name: localService.name! });
                if (res.status === "Ok") {
                  toast.success("Service updated");
                  refresh();
                } else {
                  toast.error("Failed to update service");
                }
              }
            }}
          >
            Save
          </Button>
        </div>

        <div className="flex items-center justify-start gap-2">
          By
          <Image
            src={
              service?.id === "0"
                ? "/favicon.svg"
                : (service?.user?.avatarURL ?? "https://nauth-avatars.s3.eu-north-1.amazonaws.com/avatar/default.png")
            }
            alt="avatar"
            width={20}
            height={20}
            className="rounded-sm"
          />
          <h1>{service?.id === "0" ? "NAUTH" : service?.user?.email}</h1>
        </div>
      </div>

      <div className="w-md border-t border-gray-300" />

      <div className="mt-4 w-md">
        <h1 className="text-2xl font-bold">Permissions</h1>
        <ul className="list-disc">
          {service?.permissions?.length && service?.permissions?.length > 0 ? (
            service?.permissions?.map((permission) => (
              <li key={permission.id} className="mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-start gap-2 font-semibold">{getPermissionName(permission.key ?? "")}</div>
                  <div className="text-sm text-gray-500">
                    <Copy text={permission.id ?? ""} /> • <Copy text={permission.key ?? ""} />
                  </div>
                </div>
              </li>
            ))
          ) : (
            <div>No permissions are managed by this service</div>
          )}
        </ul>
      </div>

      <div className="w-md border-t border-gray-300" />

      <div className="mt-4 w-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sessions</h1>
          <Button
            variant={"ghost"}
            onClick={() => {
              API.Client.Service.GetSession({ serviceId: service?.id ?? "" }).then((res) => {
                if (res.status === "Ok") {
                  console.log(res);
                  toast.success("Session created");
                  toast.info("Token will be copied to clipboard");
                  navigator.clipboard.writeText(res.response ?? "");
                  refresh();
                } else {
                  toast.error("Failed to create session");
                }
              });
            }}
          >
            <Plus />
          </Button>
        </div>
        <ul className="list-disc">
          {service?.sessions?.length && service?.sessions?.length > 0 ? (
            service?.sessions?.map((session) => (
              <li key={session.id} className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-start gap-2 font-semibold">{session.id ?? ""}</div>
                    <div className="flex items-center justify-start gap-1 text-sm text-gray-500">
                      Created at
                      <Copy
                        text={new Date(session.createdAt!).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hourCycle: "h23",
                        })}
                      />
                    </div>
                  </div>
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      API.Client.Session.Revoke({ sessionId: session.id ?? "" }).then((res) => {
                        if (res.status === "Ok") {
                          toast.success("Session revoked");
                          refresh();
                        } else {
                          toast.error("Failed to revoke session");
                        }
                      });
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <div>No sessions</div>
          )}
        </ul>
      </div>
    </div>
  );
}

function Copy({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
      }
      copyTimeout.current = window.setTimeout(() => {
        setIsCopied(false);
      }, 900); // 900ms to match animation
    });
  };

  return (
    <span
      className={`copy-chip ${isCopied ? "copied" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={isCopied ? "Copied" : "Copy text"}
      onClick={handleCopy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCopy();
        }
      }}
    >
      {text}
    </span>
  );
}
