import { Tenant } from "@/domain/serviceDesk";
import client from "@/lib/api";
import { DbParams, OResponse } from "@/shared/types/api";

import { CreateTenantInput, UpdateTenantInput } from "./write";

type TenantResponse = OResponse<Tenant>;

// feature-scoped API.
export const serviceDeskTenantApi = {
  list: async (params: DbParams): Promise<Tenant[]> => {
    if (!params) return [];

    const res = await client.api.get<TenantResponse>(`/api/service-desk/tenants`, {
      params,
    });

    return res.data.items;
  },
  create: async (data: CreateTenantInput) => {
    const res = await client.api.post<Tenant>(`/api/service-desk/tenants`, data);
    return res.data;
  },

  update: async (data: UpdateTenantInput) => {
    const res = await client.api.put<Tenant>(`/api/service-desk/tenants/${data.id}`, data);
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/tenants/${id}`);
    return null;
  },
};
