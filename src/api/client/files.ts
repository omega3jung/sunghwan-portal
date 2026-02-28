// src/services/fetcher/files.ts
import { ENVIRONMENT } from "@/lib/environment";

import { createClient } from "./createClient";

export const files = createClient(ENVIRONMENT.API.PORTAL);
