import { API } from "@/API/API";
import { UserBasicDTO, UserDTO } from "@/API/NauthApi_gen";
import { GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import AuthLayout from "../../components/auth/AuthLayout";
import { DeleteAccount } from "../../components/auth/DeleteAccount";

const VerifyEmailPage = () => {
  useEffect(() => {}, []);

  return (
    <AuthLayout title={"Delete account"}>
      <DeleteAccount />
    </AuthLayout>
  );
};

export default VerifyEmailPage;
