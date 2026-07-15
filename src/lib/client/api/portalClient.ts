import { ENVIRONMENT } from "@/lib/config/environment";

import { createClient } from "./createClient";

export const portal = createClient(ENVIRONMENT.API.PORTAL);
