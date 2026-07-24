import { Company } from "@/domain/organization";
import client from "@/lib/client/api";
import { DbParams, OResponse } from "@/shared/types/api";

type CompanyResponse = OResponse<Company>;

export const companyApi = {
  list: async (params: DbParams): Promise<Company[]> => {
    if (!params) return [];

    const res = await client.api.get<CompanyResponse>("/api/companies", {
      params,
    });
    return res.data.items;
  },

  get: async (id: string | number): Promise<Company | null> => {
    if (!id) return null;

    const res = await client.api.get<Company>(`/api/companies/${id}`);
    return res.data;
  },

  create: async (data: Company) => {
    const res = await client.api.post<Company>(`/api/companies`, data);
    return res.data;
  },

  update: async (data: Company) => {
    const res = await client.api.put(`/api/companies/${data.id}`, data);
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/companies/${id}`);
    return null;
  },
};
