import { Employee } from "@/domain/organization";
import client from "@/lib/api";
import { ApiResponse } from "@/shared/types";
import { DbParams } from "@/shared/types/api";

export const employeeApi = {
  list: async (params: DbParams): Promise<Employee[]> => {
    if (!params) return [];

    const res = await client.api.get<ApiResponse<Employee[]>>(
      "/api/employees",
      {
        params,
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
