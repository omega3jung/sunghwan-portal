// src/lib/client/api/index.ts
import { api } from "./client";
import { files } from "./fileClient";
import { portal } from "./portalClient";

const client = {
  api: api,
  files,
  portal,
} as const;

/** Groups the legacy, file, and portal browser transports behind one client facade. */
export default client;
