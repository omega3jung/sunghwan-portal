import axios from "axios";

/**
 * Creates the browser-facing Axios transport used by feature API clients.
 *
 * The client applies a finite request timeout and JSON defaults without
 * overwriting caller-provided headers. Authentication remains owned by the
 * application's session/API boundary; this factory does not read server-only
 * credentials or establish authorization by itself.
 */
export const createClient = (baseURL?: string) => {
  const instance = axios.create({
    timeout: 15_000,
    baseURL,
  });

  instance.interceptors.request.use(async (config) => {
    config.headers.Accept ??= "application/json";
    config.headers["Content-Type"] ??= "application/json";

    // const session = await getSession();

    //if (session?.user?.accessToken) {
    //  config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    //}

    return config;
  });

  return instance;
};
