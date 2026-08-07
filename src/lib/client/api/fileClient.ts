import { ENVIRONMENT } from "@/lib/config/environment";

import { createClient } from "./createClient";

/** Axios transport used by browser callers that request portal-hosted files. */
export const files = createClient(ENVIRONMENT.API.PORTAL);
