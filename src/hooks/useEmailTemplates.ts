import { API } from "@/API/API";
import { EmailTemplateDTO } from "@/API/NauthApi_gen";
import useSWR from "swr";

type EmailTemplatesSWRData = Awaited<ReturnType<typeof API.Client.EmailTemplates.GetAll>>;

type useEmailTemplatesParams = {
  initialEmailTemplates: EmailTemplateDTO[] | null;
};

export default function useEmailTemplates({ initialEmailTemplates }: useEmailTemplatesParams) {
  const swrState = useSWR<EmailTemplatesSWRData>(
    "/api/email-templates/all", // Stable SWR key
    () => API.Client.EmailTemplates.GetAll(), // Fetcher function
    {
      fallbackData: {
        status: initialEmailTemplates === null ? "BadRequest" : "Ok",
        response: initialEmailTemplates ?? undefined,
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
    emailTemplates: swrState.data?.response ?? [],
  };
}
