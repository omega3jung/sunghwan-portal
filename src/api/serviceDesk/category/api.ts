import client from "@/api/client";
import { ClientCategoryTree, MainCategory } from "@/domain/serviceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type CategoryResponse = OResponse<ClientCategoryTree>;

// feature-scoped API.
export const serviceDeskCategoryApi = {
  list: async (params: DbParams): Promise<ClientCategoryTree[]> => {
    if (!params) return [];

    const res = await client.api.get<CategoryResponse>(
      `/api/service-desk/categories`,
      { params },
    );

    return res.data.items;
  },
  get: async (id: string | number): Promise<MainCategory | null> => {
    if (!id) return null;

    const res = await client.api.get<MainCategory>(
      `/api/service-desk/categories/${id}`,
    );
    return res.data;
  },

  create: async (data: MainCategory) => {
    const res = await client.api.post<MainCategory>(
      `/api/service-desk/categories`,
      data,
    );
    return res.data;
  },

  update: async (data: MainCategory) => {
    const res = await client.api.put(
      `/api/service-desk/categories/${data.id}`,
      data,
    );
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/categories/${id}`);
    return null;
  },
};
