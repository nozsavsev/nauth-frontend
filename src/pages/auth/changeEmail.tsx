import AuthLayout from "../../components/auth/AuthLayout";
import { ChangeEmail } from "../../components/auth/ChangeEmail";

const ChangeEmailPage = ({}: {}) => {
  return (
    <AuthLayout title={"Change email"}>
      <ChangeEmail />
    </AuthLayout>
  );
};
export default ChangeEmailPage;
