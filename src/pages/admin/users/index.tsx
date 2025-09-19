import { API } from "@/API/API";
import { PermissionDTO, UserDTO } from "@/API/NauthApi_gen";
import AdminLayout from "@/components/admin/AdminLayout";
import { UsersAdminTab } from "@/components/admin/Users";
import { GetServerSidePropsContext } from "next";

export default function UsersPage({ _users, _permissions }: { _users: UserDTO[]; _permissions: PermissionDTO[] }) {
  return (
    <AdminLayout>
      <UsersAdminTab _users={_users || []} _permissions={_permissions || []} />
    </AdminLayout>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permissions = await API.SSR.UserManagement.GetAllPermissions({
    token: ctx.req.cookies.nauth ?? "",
  });

  const users = await API.SSR.UserManagement.GetAllUsers({
    skip: 0,
    take: 10,
    match: "",
    token: ctx.req.cookies.nauth ?? "",
  });

  console.log(users);

  return {
    props: {
      _permissions: JSON.parse(JSON.stringify(permissions.response)),
      _users: JSON.parse(JSON.stringify(users.response)),
    },
  };
};
