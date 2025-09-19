import useUser from "@/hooks/useUser";
import withPermissionClient from "@/lib/withPermission";
import { AdminPageDesk } from "@/pages/admin";
import { Box, Globe, Mail, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
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

  const { user } = useUser();
  const router = useRouter();

  return (
    <div
      className="flex w-full items-start py-8"
      // style={{ height: 'calc(100vh - 6rem)' }}
    >
      <div className="sticky top-32 flex flex-col self-start">
        {AdminTiles && AdminTiles.length > 0
          ? AdminTiles.map((tile, i) => <TabComponent href={tile.link} title={tile.name} icon={tile.icon} key={i} />)
          : null}
      </div>
      <div className="ml-8 flex h-full w-full flex-col">{children ?? null}</div>
    </div>
  );
};
export default AdminLayout;

const TabComponent = ({ href, title, icon }: { href: string; title: string; icon: any }) => {
  const router = useRouter();

  return (
    <Link
      className={`border ${
        router.asPath.includes(href.substring(href.lastIndexOf("/")).toLowerCase()) ? "border-neutral-600 bg-white saturate-50" : "border-transparent"
      } mb-4 flex items-center justify-start rounded-md px-2 py-1 ${router.asPath.includes(href.substring(href.lastIndexOf("/")).toLowerCase()) ? "font-semibold text-black" : "text-neutral-600"}`}
      href={href}
      shallow={false}
    >
      <span className={`mr-2`}>{icon}</span>
      {title}
    </Link>
  );
};
