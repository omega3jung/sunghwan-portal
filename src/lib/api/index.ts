// src/lib/api/index.ts
import { api } from "./client";
import { files } from "./fileClient";
import { portal } from "./portalClient";

const client = {
  api: api,
  files,
  portal,
} as const;

export default client;
