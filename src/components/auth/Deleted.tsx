import useUser from "@/hooks/useUser";
import Lottie from "lottie-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

export const Deleted = () => {
  const { user } = useUser();

  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  return (
    <BrandedAuthWindow>
      <Lottie
        loop={false}
        autoPlay={true}
        initialSegment={[10, 60]}
        animationData={require("../../../public/lottie/deleted.json")}
        style={{ width: "18rem" }}
      />

      <div>Your account has been deleted.</div>

      <Button className="my-8 font-semibold" variant={"ghost"} asChild>
        <Link href={"/?redirect=" + router.query?.redirect?.toString()}>Go home</Link>
      </Button>
    </BrandedAuthWindow>
  );
};
