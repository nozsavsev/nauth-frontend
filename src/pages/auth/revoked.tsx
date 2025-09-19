import AuthLayout from "../../components/auth/AuthLayout";
import { Revoked } from "../../components/auth/Revoked";

const RevokedPage = ({}: {}) => {
  return (
    <AuthLayout title={"Session revoked"}>
      <Revoked />
    </AuthLayout>
  );
};
export default RevokedPage;
