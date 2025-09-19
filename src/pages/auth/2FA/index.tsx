import AuthLayout from "../../../components/auth/AuthLayout";
import { Verify2FA } from "../../../components/auth/_2FA/Verify2FA";

const Verify2FAPage = ({}: {}) => {
  return (
    <AuthLayout title={"2FA - NAUTH"}>
      <Verify2FA />
    </AuthLayout>
  );
};
export default Verify2FAPage;
