import useUser from "@/hooks/useUser";
import { PageAccessRuleType } from "@/security-updater/generatedTypes/NauthPaths";

export default function withPermissionClient(permission: PageAccessRuleType, value: any): any | undefined {
  const { user } = useUser();

  if (permission === "AnyAdmin") {
    return (user?.permissions?.some((p) => p?.permission?.serviceId === "0") ?? false) ? value : undefined;
  }

  if (permission === "AnyAuthenticated") {
    return user !== null ? value : undefined;
  }

  if (permission === "RequireVerifiedEmail") {
    return (user?.isEmailVerified ?? false) ? value : undefined;
  }

  if (permission.startsWith("Pr")) {
    return (user?.permissions?.some((p) => p?.permission?.key === permission) ?? false) ? value : undefined;
  }

  return value;
}
