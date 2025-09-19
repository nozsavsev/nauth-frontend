import { API } from "@/API/API";
import { ServiceDTO } from "@/API/NauthApi_gen";
import useGlobalServices from "@/hooks/useGlobalServices";
import useServices from "@/hooks/useServices";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

export default function Services({ _services, global }: { _services: ServiceDTO[] | null; global: boolean }) {
  const { services, refresh } = global ? useGlobalServices({ initialServices: _services }) : useServices({ initialServices: _services });

  console.log(services);

  return (
    <>
      <ProtalClient />
      <div className="flex flex-wrap gap-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </>
  );
}

function ServiceCard({ service }: { service: ServiceDTO }) {
  return (
    <Link href={`/admin/services/${service.id}`} className="flex w-fit flex-col items-start rounded-md border-2 border-gray-300 p-4">
      <div className="mb-4 flex w-full flex-col items-start justify-start">
        <h1 className="flex w-full shrink-0 justify-between text-lg font-bold">
          <span className="truncate">{service.name}</span>
          <ExternalLink />
        </h1>
        <div className="flex items-center gap-2">
          <Image
            src={
              service?.id === "0"
                ? "/favicon.svg"
                : (service?.user?.avatarURL ?? "https://nauth-avatars.s3.eu-north-1.amazonaws.com/avatar/default.png")
            }
            alt="user avatar"
            width={20}
            height={20}
            className="rounded-sm"
          />
          <p className="text-sm text-gray-500">{service?.id === "0" ? "NAUTH" : service?.user?.email}</p>
        </div>
      </div>
      <h1 className="text-sm text-gray-500">{service.sessions?.length} sessions</h1>
      <h1 className="text-sm text-gray-500">{service.permissions?.length} permissions are managed by this service</h1>
    </Link>
  );
}

function ProtalClient() {
  const [mounted, setMounted] = useState(false);

  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true); // Indicate that the component is mounted on the client
    setElement(document.getElementById("navbar-search-portal") as HTMLElement);
    return () => setMounted(false);
  }, []);

  if (!mounted || !element) {
    return null; // Don't render the portal until mounted
  }

  return createPortal(
    <div className="flex h-full w-full items-center justify-center">
      <Button
        onClick={async () => {
          var res = await API.Client.Service.Create({
            createServiceDTO: {
              name: "New Service",
            },
          });
          if (res.status === "Ok" && res.response) {
            router.push(`/admin/services/${res.response.id}`);
            toast.success("Service created");
          } else {
            toast.error("Something went wrong");
          }
        }}
      >
        New Service
      </Button>
    </div>,
    element!,
  );
}
