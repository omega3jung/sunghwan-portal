import { ENVIRONMENT } from "@/lib/config/environment";

import { createClient } from "./createClient";

export const files = createClient(ENVIRONMENT.API.PORTAL);
