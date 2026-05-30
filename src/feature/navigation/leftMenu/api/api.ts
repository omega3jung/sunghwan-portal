// src/feature/navigation/leftMenu/api/api.ts
import client from "@/lib/api";
import { ApiResponse } from "@/shared/types";

import type { DbMenuItem } from "../types";

export const leftMenuApi = {
  get: async () => {
    const res = await client.api.get<ApiResponse<DbMenuItem[]>>(
      "/api/navigation/left-menu",
    );

    return res.data.data ?? [];
  },
};
