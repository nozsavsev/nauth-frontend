import AuthLayout from "../../../components/auth/AuthLayout";
import Recover2FA from "../../../components/auth/_2FA/Recover2FA";

const Recover2FAPage = ({}: {}) => {
  return (
    <AuthLayout title={"2FA - NAUTH"}>
      <Recover2FA />
    </AuthLayout>
  );
};
export default Recover2FAPage;
