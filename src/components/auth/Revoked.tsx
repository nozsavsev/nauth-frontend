import Lottie from "lottie-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { BrandedAuthWindow } from "./common/BrandedAuthWindow";

export const Revoked = () => {
  return (
    <BrandedAuthWindow>
      <Lottie
        loop={false}
        autoPlay={true}
        initialSegment={[20, 130]}
        animationData={require("../../../public/lottie/locked.json")}
        style={{ width: "20rem" }}
      />

      <div>Your session has been revoked.</div>

      <div className="my-8 flex w-full justify-center gap-4">
        <Button className="flex w-24 items-center justify-center font-semibold" variant={"ghost"} asChild>
          <Link className="" href="/auth/login">
            {"Login again"}
          </Link>
        </Button>

        <Button className="w-24 font-semibold" variant={"ghost"} asChild>
          <Link className="" href="/">
            {"Go home"}
          </Link>
        </Button>
      </div>
    </BrandedAuthWindow>
  );
};
