// src/services/fetcher/index.ts
import { api } from "./api";
import { files } from "./files";
import { portal } from "./portal";

const fetcher = {
  api: api,
  files,
  portal,
} as const;

export default fetcher;
