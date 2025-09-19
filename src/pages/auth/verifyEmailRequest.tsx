import AuthLayout from "../../components/auth/AuthLayout";
import { VerifyEmailRequest } from "../../components/auth/VerifyEmailRequest";

const VerifyEmailRequestPage = () => {
  return (
    <AuthLayout title={"Verify email"}>
      <VerifyEmailRequest />
    </AuthLayout>
  );
};
export default VerifyEmailRequestPage;
