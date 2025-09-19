import { API } from "@/API/API";
import { PermissionDTO } from "@/API/NauthApi_gen";
import useSWR from "swr";

type PermissionsSWRData = Awaited<ReturnType<typeof API.Client.UserManagement.GetAllPermissions>>;

type usePermissionsParams = {
  initialPermissions: PermissionDTO[] | null;
};

export default function usePermissions({ initialPermissions }: usePermissionsParams) {
  const swrState = useSWR<PermissionsSWRData>(
    "/api/premissions/all", // Stable SWR key
    () => API.Client.UserManagement.GetAllPermissions(), // Fetcher function
    {
      fallbackData: {
        status: initialPermissions === null ? "BadRequest" : "Ok",
        response: initialPermissions ?? undefined,
        authenticationFailureReasons: undefined,
      },
      revalidateOnMount: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000 * 5,
      refreshInterval: 0,
      keepPreviousData: true,
    },
  );

  return {
    refresh: swrState.mutate,
    permissions: swrState.data?.response ?? [],
  };
}
