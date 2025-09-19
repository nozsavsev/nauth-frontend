import AuthLayout from "../../components/auth/AuthLayout";
import { Login } from "../../components/auth/Login";

const LoginPage = ({}: {}) => {
  return (
    <>
      <AuthLayout title={"Login"}>
        <Login />
      </AuthLayout>
    </>
  );
};
export default LoginPage;
