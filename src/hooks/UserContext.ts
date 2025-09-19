import { API } from "@/API/API";
import { createContext } from "react";
import { SWRResponse } from "swr";

export const UserContext = createContext<SWRResponse<Awaited<ReturnType<typeof API.Client.User.CurrentUser>>, any> | null>(null);
