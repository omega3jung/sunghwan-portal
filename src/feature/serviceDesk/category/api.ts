import { MainCategory, TenantCategoryTree } from "@/domain/serviceDesk";
import type { SaveServiceDeskCategoryTreePayload } from "@/feature/serviceDesk/category/types";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/feature/serviceDesk/category/write";
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
  get: async (id: string | number): Promise<MainCategory | null> => {
    if (!id) return null;

    const res = await client.api.get<MainCategory>(
      `/api/service-desk/categories/${id}`,
    );
    return res.data;
  },

  create: async (data: CreateCategoryInput) => {
    const res = await client.api.post<MainCategory>(
      `/api/service-desk/categories`,
      data,
    );
    return res.data;
  },

  update: async (data: UpdateCategoryInput) => {
    const res = await client.api.put<MainCategory>(
      `/api/service-desk/categories/${data.id}`,
      data,
    );
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/categories/${id}`);
    return null;
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
