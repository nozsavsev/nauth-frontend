import { NextRequest, NextResponse } from "next/server";

import { API } from "@/API/API";
import { UserDTO } from "@/API/NauthApi_gen";
import { isAnyAdmin } from "./lib/isAnyAdmin";
import { NauthPaths, PageAccessRuleType, SecurityDescriptor } from "./security-updater/generatedTypes/NauthPaths";

function protoCmp({ prototype, path }: { prototype: string; path: string }) {
  prototype = prototype.startsWith("/") ? prototype.substring(1) : prototype;
  prototype = prototype.length > 1 && prototype.endsWith("/") ? prototype.slice(0, -1) : prototype;

  path = path.startsWith("/") ? path.substring(1) : path;
  path = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

  const prototypeSegments = prototype.split("/") || [""];
  const pathSegments = path.split("/") || [""];

  if (prototypeSegments.length <= pathSegments.length)
    if (prototypeSegments.length === 1 && prototypeSegments[0] === "") {
      return true;
    }

  if (prototypeSegments.length > pathSegments.length) return false;

  for (let i = 0; i < prototypeSegments.length; i++) {
    if (prototypeSegments[i].startsWith("[") && prototypeSegments[i].endsWith("]") && pathSegments[i].length > 0) {
      continue;
    }

    if (prototypeSegments[i] !== pathSegments[i]) {
      return false;
    }
  }

  return true;
}

function getPermissionsForPath(path: string) {
  const permissions: PageAccessRuleType[] = [];
  for (const key of Object.keys(SecurityDescriptor) as NauthPaths[]) {
    if (protoCmp({ prototype: key, path: path })) {
      permissions.push(...SecurityDescriptor[key]);
    }
  }

  if (permissions.length > 0) permissions.unshift("AnyAuthenticated");
  return permissions.filter((value, index, self) => self.indexOf(value) === index);
}

function checkPermission(permissionName: PageAccessRuleType, user?: UserDTO): "pass" | "loginRedirect" | "forbidden" {
  switch (permissionName) {
    case "AnyAdmin":
      return isAnyAdmin(user) ? "pass" : "forbidden";
    case "AnyAuthenticated":
      return !!user ? "pass" : "loginRedirect";
    case "RequireVerifiedEmail":
      return user?.isEmailVerified ? "pass" : "forbidden";

    default:
      if (permissionName.startsWith("Pr")) {
        return user?.permissions?.some((up) => up.permission?.key === permissionName) ? "pass" : "forbidden";
      } else {
        return "forbidden";
      }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon.png") ||
    pathname.startsWith("/locale") ||
    pathname.startsWith("/logos") ||
    [".png", ".jpg", ".jpeg", ".svg"].some((ext) => pathname.endsWith(ext))
  )
    return NextResponse.next();

  const combinedPermissionRequests = getPermissionsForPath(pathname);

  if (combinedPermissionRequests.length === 0) return NextResponse.next();
  else {
    const user_rsp = await API.SSR.User.CurrentUser({
      token: request.cookies.get("nauth")?.value ?? "",
    });

    if (user_rsp?.authenticationFailureReasons?.includes("_2FARequired")) {
      if (!pathname.startsWith("/auth/2FA")) {
        return NextResponse.redirect(new URL("/auth/2FA", request.url));
      } else {
        return NextResponse.next();
      }
    }

    if (pathname.startsWith("/auth/2FA") && !user_rsp.response) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const user = user_rsp.response;

    const permissonChecks = combinedPermissionRequests
      .map((permission) => checkPermission(permission, user!))
      .filter((value) => value !== "pass")
      .filter((value, index, self) => self.indexOf(value) === index);

    if (permissonChecks.includes("loginRedirect")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (permissonChecks.includes("forbidden")) {
      if (checkPermission("AnyAdmin", user!) === "pass" && pathname.startsWith("/admin")) {
        const failedPermissions = combinedPermissionRequests
          .map((p) => {
            return {
              permission: p,
              result: checkPermission(p, user!),
            };
          })
          .filter((r) => r.result !== "pass")
          .map((r) => r.permission);

        return NextResponse.rewrite(new URL(`/auth/verificationExplainer?pageAccess=true&required=${failedPermissions?.join(",")}`, request.url));
      }

      return NextResponse.rewrite(new URL("/405", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.png|locale|logos).*)", "/"],
};
