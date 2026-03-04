import client from "@/api/client";
import { Category, ClientCategoryTree } from "@/domain/serviceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type CategoryResponse = OResponse<ClientCategoryTree>;

// feature-scoped API.
export const serviceDeskCategoryApi = {
  fetch: async (params: DbParams): Promise<ClientCategoryTree[]> => {
    if (!params) return [];

    const res = await client.api.get<CategoryResponse>(
      "/api/service-desk/categories",
      { params },
    );

    return res.data.items;
  },

  post: async (data: Category) => {
    const res = await fetch("/api/service-desk/categories", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: Category) => {
    const res = await fetch("/api/service-desk/categories", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: Category) => {
    await fetch("/api/service-desk/categories", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
