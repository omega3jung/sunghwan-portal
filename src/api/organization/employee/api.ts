import client from "@/api/client";
import { Employee } from "@/domain/organization";
import { DbParams, OResponse } from "@/shared/types/api";

type EmployeeResponse = OResponse<Employee>;

export const employeeApi = {
  list: async (params: DbParams): Promise<Employee[]> => {
    if (!params) return [];

    const res = await client.api.get<EmployeeResponse>("/api/employees", {
      params,
    });
    return res.data.items;
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
