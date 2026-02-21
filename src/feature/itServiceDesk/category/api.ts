import fetcher from "@/services/fetcher";
import { DbParams, OResponse } from "@/shared/types/api";

import { Category, ClientCategoryTree } from "./types";

type CategoryResponse = OResponse<ClientCategoryTree>;

export const itServiceDeskCategoryApi = {
  fetch: async (params: DbParams): Promise<ClientCategoryTree[]> => {
    if (!params) return [];

    const res = await fetcher.api.get<CategoryResponse>(
      "/api/it-service-desk/category",
      { params },
    );

    return res.data.items;
  },

  post: async (data: Category) => {
    const res = await fetch("/api/it-service-desk/category", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: Category) => {
    const res = await fetch("/api/it-service-desk/category", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: Category) => {
    await fetch("/api/it-service-desk/category", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
