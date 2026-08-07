import { Tenant } from "@/domain/serviceDesk";
import type {
  CreateTenantInput,
  ServiceDeskTenantListParams,
  UpdateTenantInput,
} from "@/lib/application/contracts/serviceDesk";
import client from "@/lib/client/api";
import { OResponse } from "@/shared/types/api";
import { buildDbSearchParams } from "@/shared/utils/routing";

type TenantResponse = OResponse<Tenant>;

export const serviceDeskTenantApi = {
  list: async (params: ServiceDeskTenantListParams): Promise<Tenant[]> => {
    if (!params) return [];

    const res = await client.api.get<TenantResponse, URLSearchParams>(
      `/api/service-desk/tenants`,
      {
        params: buildDbSearchParams(params),
      },
    );

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
