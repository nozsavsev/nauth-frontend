import { EmailActionsControllerClient } from "./Client/EmailActionsController";
import { EmailTemplatesControllerClient } from "./Client/EmailTemplatesController";
import { StatusControllerClient } from "./Client/ServerStatusController";
import { ServiceControllerClient } from "./Client/ServiceController";
import { SessionControllerClient } from "./Client/SessionController";
import { UserControllerClient } from "./Client/UserController";
import { UserManagementControllerClient } from "./Client/UserManagementController";
import * as NauthApi from "./NauthApi_gen";
import { EmailActionsControllerSSR } from "./SSR/EmailActionsControllerSSR";
import { EmailTemplatesControllerSSR } from "./SSR/EmailTemplatesControllerSSR";
import { ServerStatusControllerSSR } from "./SSR/ServerStatusControllerSSR";
import { ServiceControllerSSR } from "./SSR/ServiceControllerSSR";
import { SessionControllerSSR } from "./SSR/SessionControllerSSR";
import { UserControllerSSR } from "./SSR/UserControllerSSR";
import { UserManagementControllerSSR } from "./SSR/UserManagementControllerSSR";

const dev = process.env.NODE_ENV !== "production";

export type ClientConfigENV = {
  API_BASE: string;
  API_BASE_SSR: string;
  API_BASE_REALTIME: string;
};

class ClientConfig {
  public static basePath = "http://localhost:5035";
  public static basePathSSR = process.env.API_BASE_SSR;
  public static basePathRealtime = "http://localhost:5035/authHub";
}

export default ClientConfig;

export const GetDefaultConfig = () => {
  return new NauthApi.Configuration({
    credentials: "include",
    basePath: ClientConfig.basePath,
  });
};

export type SSRConfigParameters = {
  token: string;
};

export const GetSSRDefaultConfig = (params: SSRConfigParameters) => {
  return new NauthApi.Configuration({
    credentials: "include",
    basePath: ClientConfig.basePathSSR,
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  });
};

function hydrateDateTimeObjects(obj: any) {
  const visited = new WeakSet();

  const recurse = (currentObj: any) => {
    if (currentObj === null || typeof currentObj !== "object") {
      return;
    }

    if (visited.has(currentObj)) {
      return;
    }
    visited.add(currentObj);

    // This handles both arrays and objects
    for (const key in currentObj) {
      // biome-ignore lint/suspicious/noPrototypeBuiltins: We need to check for own properties
      if (!currentObj.hasOwnProperty(key)) {
        continue;
      }

      const value = currentObj[key];
      if (typeof value === "string") {
        // Regex to check for ISO 8601 format. This is not perfect, but it's a good heuristic.
        // It looks for YYYY-MM-DDTHH:MM:SS format, with optional milliseconds and timezone.
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))?$/;
        if (iso8601Regex.test(value)) {
          const parsedDate = new Date(value);
          // Check if the date is valid. `new Date()` can return 'Invalid Date' which is a Date object whose time value is NaN.
          if (!isNaN(parsedDate.getTime())) {
            currentObj[key] = parsedDate;
          } else {
            currentObj[key] = new Date();
          }
        }
      } else if (typeof value === "object" && value !== null) {
        recurse(value);
      }
    }
  };

  recurse(obj);
}

export const ExecuteApiRequest = async <T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): Promise<
  | ReturnType<T>
  | {
      status: "ServerDown";
      response: null;
      authenticationFailureReasons: NauthApi.AuthFailureReasons[];
    }
> => {
  try {
    hydrateDateTimeObjects(args);
    let res = await fn(...args);
    hydrateDateTimeObjects(res);
    return res;
  } catch (e: any) {
    console.log(e);

    try {
      const payload: NauthApi.StringResponseWrapper =
        (await e.response?.json()) ||
        ({
          status: "ServerDown",
          response: null,
          authenticationFailureReasons: [],
        } as NauthApi.StringResponseWrapper);

      if (
        typeof window !== "undefined" &&
        //@ts-ignore
        !window.noRedirects
      ) {
        //process client only redirects

        if (payload.status === "Forbidden") {
          console.log(payload);

          if (!window.location.pathname.includes("/auth/2FA") && payload?.authenticationFailureReasons?.includes("_2FARequired")) {
            window.location.href = `/auth/2FA?redirect=${window.location.pathname}`;
          } else if (!window.location.pathname.includes("/auth/") && payload?.authenticationFailureReasons?.includes("SessionExpired") == false) {
            window.location.href = `/auth/verificationExplainer?required=${payload?.authenticationFailureReasons?.join(",")}&redirect=${window.location.pathname}`;
          }
        }

        if (payload.status === "ServerDown" && !window.location.pathname.includes("/500")) {
          window.location.href = "/500?redirect=" + window.location.pathname;
        }
      }

      return payload as any;
    } catch (_e) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/500")) {
        window.location.href = "/500?redirect=" + window.location.pathname;
      }

      return {
        status: "ServerDown",
        response: null,
        authenticationFailureReasons: [],
      };
    }
  }
};

class Client_API {
  public get EmailActions(): EmailActionsControllerClient {
    return new EmailActionsControllerClient();
  }

  public get EmailTemplates(): EmailTemplatesControllerClient {
    return new EmailTemplatesControllerClient();
  }

  public get Service(): ServiceControllerClient {
    return new ServiceControllerClient();
  }

  public get User(): UserControllerClient {
    return new UserControllerClient();
  }

  public get Session(): SessionControllerClient {
    return new SessionControllerClient();
  }

  public get ServerStatus(): StatusControllerClient {
    return new StatusControllerClient();
  }

  public get UserManagement(): UserManagementControllerClient {
    return new UserManagementControllerClient();
  }
}

class SSR_API {
  public get EmailActions(): EmailActionsControllerSSR {
    return new EmailActionsControllerSSR();
  }

  public get EmailTemplates(): EmailTemplatesControllerSSR {
    return new EmailTemplatesControllerSSR();
  }

  public get Service(): ServiceControllerSSR {
    return new ServiceControllerSSR();
  }

  public get User(): UserControllerSSR {
    return new UserControllerSSR();
  }

  public get Session(): SessionControllerSSR {
    return new SessionControllerSSR();
  }

  public get ServerStatus(): ServerStatusControllerSSR {
    return new ServerStatusControllerSSR();
  }

  public get UserManagement(): UserManagementControllerSSR {
    return new UserManagementControllerSSR();
  }
}

export class API {
  public static readonly SSR = new SSR_API();
  public static readonly Client = new Client_API();
}
