import { API } from "@/API/API";
import { ServiceDTO } from "@/API/NauthApi_gen";
import useSWR from "swr";

type ServiceSWRData = Awaited<ReturnType<typeof API.Client.Service.GetById>>;

type useServiceParams = {
  initialService: ServiceDTO | null;
};

export default function useEmailTemplates({ initialService }: useServiceParams) {
  const swrState = useSWR<ServiceSWRData>(
    `/api/services_owned/${initialService?.id}`, // Stable SWR key
    () => API.Client.Service.GetById({ serviceId: initialService?.id ?? "" }), // Fetcher function
    {
      fallbackData: {
        status: initialService === null ? "BadRequest" : "Ok",
        response: initialService ?? undefined,
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
    service: swrState.data?.response ?? null,
  };
}
