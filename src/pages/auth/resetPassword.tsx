import AuthLayout from "../../components/auth/AuthLayout";
import { ResetPassword } from "../../components/auth/ResetPassword";

const ResetPasswordPage = () => {
  return (
    <AuthLayout title={"Change password"}>
      <ResetPassword />
    </AuthLayout>
  );
};
export default ResetPasswordPage;
