import { TenantCategoryTree } from "@/domain/serviceDesk";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";
import client from "@/lib/api";
import { DbParams, OResponse } from "@/shared/types/api";

type CategoryResponse = OResponse<TenantCategoryTree>;

// feature-scoped API.
export const serviceDeskCategoryApi = {
  list: async (params: DbParams): Promise<TenantCategoryTree[]> => {
    if (!params) return [];

    const res = await client.api.get<CategoryResponse>(
      `/api/service-desk/categories`,
      { params },
    );

    return res.data.items;
  },
  saveTree: async (
    payload: SaveServiceDeskCategoryTreePayload,
  ): Promise<TenantCategoryTree> => {
    const res = await client.api.put<TenantCategoryTree>(
      `/api/service-desk/categories`,
      payload,
    );

    return res.data;
  },
};
