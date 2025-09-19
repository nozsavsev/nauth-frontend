import { useRouter } from "next/router";

import { AuthFailureReasons } from "@/API/NauthApi_gen";
import useUser from "@/hooks/useUser";
import Link from "next/link";
import { AiOutlineMail } from "react-icons/ai";
import { SiGoogleauthenticator } from "react-icons/si";
import AuthLayout from "../../components/auth/AuthLayout";
import { BrandedAuthWindow } from "../../components/auth/common/BrandedAuthWindow";

export default function VerificationExplainer({ required, pageAccess }: { required: AuthFailureReasons[]; pageAccess: boolean }) {
  const router = useRouter();
  const { user, refresh } = useUser();

  return (
    <AuthLayout title={"Let's fix it all"}>
      <BrandedAuthWindow>
        <div className="my-10 mb-12">
          {(required?.includes("RequireVerifiedEmail") || required?.includes("Require2FASetup")) && (
            <>
              <div className="mb-4 text-center">You just tried to {pageAccess ? "access page" : "execute action"} you don't have permission for.</div>
              <div className="mb-6 text-start font-semibold">Please complete following steps:</div>
            </>
          )}

          {required?.includes("RequireVerifiedEmail") && (
            <div className="mb-5 flex items-center justify-between">
              <Link
                target="_blank"
                href="/auth/verifyEmailRequest"
                className="flex items-center justify-center space-x-2 rounded-lg border border-green-700 bg-white px-3 py-1 font-semibold text-green-700"
              >
                <AiOutlineMail className="text-xl" />
                <span>Verify your email</span>
              </Link>
            </div>
          )}

          {required?.includes("Require2FASetup") && (
            <div className="mb-5 flex items-center justify-between">
              <Link
                target="_blank"
                href="/account/security#2FA"
                className="flex items-center justify-center space-x-2 rounded-lg border border-green-700 bg-white px-3 py-1 font-semibold text-green-700"
              >
                <SiGoogleauthenticator className="text-xl" />
                <span>Setup 2FA</span>
              </Link>
            </div>
          )}
          {required?.filter((e) => e.toLowerCase().startsWith("pr"))?.length > 0 && (
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-base">Request following permissons from your supervisor:</h1>
            </div>
          )}

          {required?.filter((e) => e.toLowerCase().startsWith("pr"))?.length > 0 && (
            <div className="prose mb-5 flex items-center justify-between">
              <ul>
                {required?.map((e, i) => {
                  return <li key={i}>{e}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      </BrandedAuthWindow>
    </AuthLayout>
  );
}

export function getServerSideProps(context: any) {
  const arr = (context.query.required.includes(",") ? context.query.required.split(",") : [context.query.required]) || [];

  if (arr.length > 0) {
    return {
      props: {
        required: arr,
        pageAccess: context.query.pageAccess || false,
      },
    };
  } else {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
}
