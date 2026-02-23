import client from "@/api/client";
import { Category, ClientCategoryTree } from "@/domain/itServiceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type CategoryResponse = OResponse<ClientCategoryTree>;

// feature-scoped API.
export const itServiceDeskCategoryApi = {
  fetch: async (params: DbParams): Promise<ClientCategoryTree[]> => {
    if (!params) return [];

    const res = await client.api.get<CategoryResponse>(
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
