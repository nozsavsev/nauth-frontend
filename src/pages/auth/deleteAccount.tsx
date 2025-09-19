import { API } from "@/API/API";
import { UserBasicDTO, UserDTO } from "@/API/NauthApi_gen";
import { GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import { DeleteAccount } from "../../components/auth/DeleteAccount";

const VerifyEmailPage = ({ user }: { user?: UserDTO }) => {
  useEffect(() => {}, []);

  return (
    <AuthLayout title={"Delete account"}>
      <DeleteAccount />
    </AuthLayout>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const user = await API.SSR.EmailActions.DecodeToken(
    {
      token: ctx?.query?.token?.toString() || "",
    },
    {
      token: ctx?.query?.token?.toString() || "",
    },
  );

  return {
    props: {
      user: (user?.response?.user as UserBasicDTO) || null,
    },
  };
}

export default VerifyEmailPage;
