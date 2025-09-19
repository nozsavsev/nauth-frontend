import AuthLayout from "../../components/auth/AuthLayout";
import { VerifyEmail } from "../../components/auth/VerifyEmail";

const VerifyEmailPage = ({}: {}) => {
  return (
    <AuthLayout title={"Verify email"}>
      <VerifyEmail />
    </AuthLayout>
  );
};
export default VerifyEmailPage;
