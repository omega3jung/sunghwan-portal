import { Employee } from "@/domain/organization";
import client from "@/lib/api";
import type { ApiResponse, DbParams } from "@/shared/types";
import { buildDbSearchParams } from "@/shared/utils/routing";

export const employeeApi = {
  list: async (params: DbParams): Promise<Employee[]> => {
    const res = await client.api.get<ApiResponse<Employee[]>, URLSearchParams>(
      "/api/employees",
      {
        params: buildDbSearchParams(params),
      },
    );
    return res.data.data;
  },

  get: async (id: string | number): Promise<Employee | null> => {
    if (!id) return null;

    const res = await client.api.get<Employee>(`/api/employees/${id}`);
    return res.data;
  },

  create: async (data: Employee) => {
    const res = await client.api.post<Employee>(`/api/employees`, data);
    return res.data;
  },

  update: async (data: Employee) => {
    const res = await client.api.put(`/api/employees/${data.id}`, data);
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/employees/${id}`);
    return null;
  },
};
