import { Tenant } from "@/domain/serviceDesk";
import client from "@/lib/api";
import { DbParams, OResponse } from "@/shared/types/api";

type TenantResponse = OResponse<Tenant>;

// feature-scoped API.
export const serviceDeskTenantApi = {
  list: async (params: DbParams): Promise<Tenant[]> => {
    if (!params) return [];

    const res = await client.api.get<TenantResponse>(
      `/api/service-desk/categories`,
      { params },
    );

    return res.data.items;
  },
  get: async (id: string | number): Promise<Tenant | null> => {
    if (!id) return null;

    const res = await client.api.get<Tenant>(
      `/api/service-desk/categories/${id}`,
    );
    return res.data;
  },

  create: async (data: Tenant) => {
    const res = await client.api.post<Tenant>(
      `/api/service-desk/categories`,
      data,
    );
    return res.data;
  },

  update: async (data: Tenant) => {
    const res = await client.api.put<Tenant>(
      `/api/service-desk/categories/${data.id}`,
      data,
    );
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/categories/${id}`);
    return null;
  },

  saveList: async (payload: Tenant[]): Promise<Tenant[]> => {
    const res = await client.api.put<Tenant[]>(
      `/api/service-desk/categories`,
      payload,
    );

    return res.data;
  },
};
