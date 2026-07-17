import { TenantCategoryTree } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskCategoryTreePayload,
  ServiceDeskCategoryContext,
  ServiceDeskCategoryListParams,
} from "@/feature/serviceDesk/category/types";
import client from "@/lib/client/api";
import { OResponse } from "@/shared/types/api";
import { buildDbSearchParams } from "@/shared/utils/routing";

type CategoryResponse = OResponse<TenantCategoryTree>;

// feature-scoped API.
export const serviceDeskCategoryApi = {
  list: async (
    params?: ServiceDeskCategoryListParams,
  ): Promise<TenantCategoryTree[]> => {
    if (!params) return [];

    const res = await client.api.get<CategoryResponse, URLSearchParams>(
      `/api/service-desk/categories`,
      { params: buildDbSearchParams(params) },
    );

    return res.data.items;
  },
  getContext: async (
    categoryId: string | number,
  ): Promise<ServiceDeskCategoryContext> => {
    const normalizedCategoryId = String(categoryId).trim();
    const res = await client.api.get<ServiceDeskCategoryContext>(
      `/api/service-desk/categories/${encodeURIComponent(normalizedCategoryId)}/context`,
    );

    return res.data;
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
