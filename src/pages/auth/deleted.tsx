import AuthLayout from "../../components/auth/AuthLayout";
import { Deleted } from "../../components/auth/Deleted";

const DeletedPage = ({}: {}) => {
  return (
    <AuthLayout title={"Account deleted"}>
      <Deleted />
    </AuthLayout>
  );
};
export default DeletedPage;
