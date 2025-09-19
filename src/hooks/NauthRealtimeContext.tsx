import { NauthRealtime } from "@/API/NauthRealtime";
import { createContext, useContext } from "react";

export const NauthRealtimeContext = createContext<NauthRealtime | null>(null);

export const NauthRealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const realtime = new NauthRealtime();
  return <NauthRealtimeContext.Provider value={realtime}>{children}</NauthRealtimeContext.Provider>;
};

export const useNauthRealtime = () => {
  const context = useContext(NauthRealtimeContext);
  if (!context) {
    throw new Error("useNauthRealtime must be used within a NauthRealtimeProvider");
  }
  return context;
};
