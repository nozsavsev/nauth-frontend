import { useContext } from "react";
import { UserContext } from "./UserContext";

export default function useUser() {
  const userSWR = useContext(UserContext);

  if (userSWR === null) {
    throw new Error("useUser must be used within a UserProvider.");
  }

  const user = userSWR.data?.status === "Ok" ? (userSWR.data.response ?? null) : null;

  return {
    user,
    isLoading: userSWR.isLoading,
    refresh: userSWR.mutate,
  };
}
