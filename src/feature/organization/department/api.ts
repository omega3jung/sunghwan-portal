import { Department } from "@/domain/organization";
import client from "@/lib/api";
import type { DbParams, OResponse } from "@/shared/types/api";
import { buildDbSearchParams } from "@/shared/utils/routing";

type DepartmentResponse = OResponse<Department>;

export const departmentApi = {
  list: async (params: DbParams): Promise<Department[]> => {
    if (!params) return [];

    const res = await client.api.get<DepartmentResponse, URLSearchParams>(
      "/api/departments",
      {
        params: buildDbSearchParams(params),
      },
    );
    return res.data.items;
  },

  get: async (id: string | number): Promise<Department | null> => {
    if (!id) return null;

    const res = await client.api.get<Department>(`/api/departments/${id}`);
    return res.data;
  },

  create: async (data: Department) => {
    const res = await client.api.post<Department>(`/api/departments`, data);
    return res.data;
  },

  update: async (data: Department) => {
    const res = await client.api.put(`/api/departments/${data.id}`, data);
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/departments/${id}`);
    return null;
  },
};
