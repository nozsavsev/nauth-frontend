import { useRouter } from "next/router";

import useUser from "@/hooks/useUser";
import Link from "next/link";
import { AiOutlineMail } from "react-icons/ai";
import { BsPhone } from "react-icons/bs";
import AuthLayout from "../../components/auth/AuthLayout";
import { BrandedAuthWindow } from "../../components/auth/common/BrandedAuthWindow";

export default function VerificationExplainer({
  required,
}: {
  required: ("EmailNotVerified" | "UserDisabled" | "NoPhoneNumber" | "AdminRequired")[];
}) {
  const router = useRouter();
  const { user, refresh } = useUser();
  return (
    <AuthLayout title={"Let's fix it all"}>
      <BrandedAuthWindow>
        <div className="my-10 mb-12">
          <div className="mb-4 text-center">You just tried to execute action you can't for now. </div>
          <div className="mb-6 text-start font-semibold">Please complete following steps:</div>

          {required?.includes("EmailNotVerified") && (
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg">Verify your email</h1>
              <Link
                target="_blank"
                href="/auth/verifyEmailRequest"
                className="flex items-center justify-center space-x-2 rounded-lg bg-green-700 px-3 py-1 font-semibold text-white"
              >
                <AiOutlineMail className="text-xl" />
                <span>Verify</span>
              </Link>
            </div>
          )}

          {required?.includes("NoPhoneNumber") && (
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg">Verify your email</h1>
              <Link
                target="_blank"
                href="/auth/verifyPhoneNumber"
                className="flex items-center justify-center space-x-2 rounded-lg bg-green-700 px-3 py-1 font-semibold text-white"
              >
                <BsPhone className="text-xl" />
                <span>Verify</span>
              </Link>
            </div>
          )}

          {/* {required?.includes('AdminRequired') && (
            <div className="mb-5 flex justify-between items-center">
              <h1 className="text-lg">Request permissons from your supervisor</h1>
              <Link
                target="_blank"
                href="/auth/verifyEmailRequest"
                className="flex px-3 py-1 rounded-lg items-center justify-center space-x-2 bg-green-700 text-white font-semibold"
              >
                <BsShieldExclamation className="text-xl" />
                <span>View</span>
              </Link>
            </div>
          )} */}
        </div>
      </BrandedAuthWindow>
    </AuthLayout>
  );
}

export function getServerSideProps(context: any) {
  return { props: { required: context.query.required || [] } };
}
