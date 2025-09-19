import useUser from "@/hooks/useUser";
import withPermissionClient from "@/lib/withPermission";
import Lottie from "lottie-react";
import { Box, Globe, Mail, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export type AdminPageDesk = {
  name: string;
  link: string;
  icon: any;
  description: string;
};

const Admin = ({}: {}) => {
  const router = useRouter();
  const { user } = useUser();

  const AdminTiles: AdminPageDesk[] =
    [
      withPermissionClient("PrManageOwnServices", {
        name: "Services",
        link: "/admin/services",
        icon: <Box />,
        description: "Manage your application services.",
      }),

      withPermissionClient("PrManageUsers", {
        name: "Users",
        link: "/admin/users",
        icon: <Users />,
        description: "Manage users, and permissions.",
      }),

      withPermissionClient("PrManageServices", {
        name: "Services Global",
        link: "/admin/global_services",
        icon: <Globe />,
        description: "Oversee all services across the platform.",
      }),

      withPermissionClient("PrManageEmailTemplates", {
        name: "Email Templates",
        link: "/admin/email_templates",
        icon: <Mail />,
        description: "Customize and manage email templates.",
      }),
    ].filter((e) => e !== undefined) || null;

  return (
    <div className="flex min-h-full w-full shrink-0 grow items-center justify-center">
      {AdminTiles && AdminTiles.length > 0 ? (
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 p-4 md:grid-cols-2">
          {AdminTiles.map((tile, i) => (
            <AdminPageTile key={i} {...tile} />
          ))}
        </div>
      ) : (
        <div className="flex grow items-center justify-center">
          <div className="mt-8 flex max-w-lg flex-col gap-4 rounded-lg p-4 text-center">
            <div className="grid auto-rows-min items-start gap-1.5 p-2">
              <div className="mx-auto flex w-48 justify-center">
                <Lottie loop={false} initialSegment={[20, 130]} autoPlay={true} animationData={require("../../../public/lottie/locked.json")} />
              </div>
              <div className="leading-none font-semibold">No Admin Permissions</div>
              <div className="text-muted-foreground text-sm">
                You do not have the necessary permissions to view this page.
                <br />
                Please contact an administrator if you believe this is an error.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

const AdminPageTile = ({ name, link, icon, description }: AdminPageDesk) => {
  return (
    <Link
      href={link}
      className="bg-card text-card-foreground hover:border-primary/60 flex h-32 items-center rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
    >
      <span className="text-primary mr-6 text-4xl">{icon}</span>
      <div className="text-left">
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Link>
  );
};
