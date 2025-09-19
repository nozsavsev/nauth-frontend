import { API } from "@/API/API";
import { ServiceDTO } from "@/API/NauthApi_gen";
import useSWR from "swr";

type ServicesSWRData = Awaited<ReturnType<typeof API.Client.Service.GetAllGlobal>>;

type useServicesParams = {
  initialServices: ServiceDTO[] | null;
};

export default function useEmailTemplates({ initialServices }: useServicesParams) {
  const swrState = useSWR<ServicesSWRData>(
    "/api/services_owned/all", // Stable SWR key
    () => API.Client.Service.GetAllOwned(), // Fetcher function
    {
      fallbackData: {
        status: initialServices === null ? "BadRequest" : "Ok",
        response: initialServices ?? undefined,
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
    services: swrState.data?.response ?? [],
  };
}
