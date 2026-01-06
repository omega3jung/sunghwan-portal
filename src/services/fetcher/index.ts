// src/services/fetcher/index.ts
import { apiClient } from "./api";
import { dbFetcher } from "./db";
import { files } from "./files";
import { portal } from "./portal";

const fetcher = {
  api: apiClient,
  db: dbFetcher,
  files,
  portal,
} as const;

export default fetcher;
