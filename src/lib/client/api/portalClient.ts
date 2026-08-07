import { ENVIRONMENT } from "@/lib/config/environment";

import { createClient } from "./createClient";

/**
 * Shared client transport for the configured public Portal API endpoint.
 *
 * This is a browser integration facade, not a server repository client. Server
 * code uses the database/portal API boundaries under `src/server` instead.
 */
export const portal = createClient(ENVIRONMENT.API.PORTAL);
