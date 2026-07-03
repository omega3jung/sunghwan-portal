import { TenantCategoryTree } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskCategoryTreePayload,
  ServiceDeskCategoryListParams,
} from "@/feature/serviceDesk/category/types";
import client from "@/lib/api";
import { OResponse } from "@/shared/types/api";
import { buildDbSearchParams } from "@/shared/utils/routing";

type CategoryResponse = OResponse<TenantCategoryTree>;

// feature-scoped API.
export const serviceDeskCategoryApi = {
  list: async (
    params?: ServiceDeskCategoryListParams,
  ): Promise<TenantCategoryTree[]> => {
    if (!params) return [];

    const searchParams = buildDbSearchParams(params);

    if (params.tenantId) {
      searchParams.set("tenantId", params.tenantId);
    }

    if (params.active !== undefined) {
      searchParams.set("active", String(params.active));
    }

    const res = await client.api.get<CategoryResponse, URLSearchParams>(
      `/api/service-desk/categories`,
      { params: searchParams },
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
