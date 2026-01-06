// src/services/fetcher/portal.ts
import { ENVIRONMENT } from "@/lib/environment";

import { createClient } from "./createClient";

export const portal = createClient(ENVIRONMENT.API.PORTAL);
