import { UserDTO } from "@/API/NauthApi_gen";

export const isAnyAdmin = (user: UserDTO | null | undefined) => {
  return user?.permissions?.some((p) => p?.permission?.serviceId === "0") ?? false;
};
