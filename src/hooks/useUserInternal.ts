import { API } from "@/API/API";
import { UserDTO } from "@/API/NauthApi_gen";
import useSWR from "swr";

type UserSWRData = Awaited<ReturnType<typeof API.Client.User.CurrentUser>>;

type useUserInternalParams = {
  initialUser: UserDTO | null;
};

export default function useUserInternal({ initialUser }: useUserInternalParams) {
  const swrState = useSWR<UserSWRData>(
    "/api/user/current", // Stable SWR key
    () => API.Client.User.CurrentUser(), // Fetcher function
    {
      fallbackData: {
        status: initialUser === null ? "BadRequest" : "Ok",
        response: initialUser ?? undefined,
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

  return swrState;
}
