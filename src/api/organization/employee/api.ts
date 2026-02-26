import client from "@/api/client";
import { Employee } from "@/domain/organization";
import { DbParams, OResponse } from "@/shared/types/api";

type EmployeeResponse = OResponse<Employee>;

export const employeeApi = {
  fetch: async (params: DbParams): Promise<Employee[]> => {
    if (!params) return [];

    const res = await client.api.get<EmployeeResponse>("/api/employees", {
      params,
    });

    return res.data.items;
  },
  post: async (data: Employee) => {
    const res = await fetch("/api/employees", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: Employee) => {
    const res = await fetch("/api/employees", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: Employee) => {
    await fetch("/api/employees", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
