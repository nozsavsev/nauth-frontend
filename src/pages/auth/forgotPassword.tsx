import AuthLayout from "../../components/auth/AuthLayout";
import { ForgotPassword } from "../../components/auth/ForgotPassword";

const ForgotPasswordPage = () => {
  return (
    <AuthLayout title={"Forgot password"}>
      <ForgotPassword />
    </AuthLayout>
  );
};
export default ForgotPasswordPage;
