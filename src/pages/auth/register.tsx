import AuthLayout from "../../components/auth/AuthLayout";
import { Register } from "../../components/auth/Register";

const RegisterPage = () => {
  return (
    <AuthLayout title={"Register"}>
      <Register />
    </AuthLayout>
  );
};
export default RegisterPage;
