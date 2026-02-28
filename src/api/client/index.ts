// src/services/fetcher/index.ts
import { api } from "./api";
import { files } from "./files";
import { portal } from "./portal";

const client = {
  api: api,
  files,
  portal,
} as const;

export default client;
