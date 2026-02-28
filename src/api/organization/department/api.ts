import client from "@/api/client";
import { Department } from "@/domain/organization";
import { DbParams, OResponse } from "@/shared/types/api";

type DepartmentResponse = OResponse<Department>;

export const departmentApi = {
  fetch: async (params: DbParams): Promise<Department[]> => {
    if (!params) return [];

    const res = await client.api.get<DepartmentResponse>("/api/departments", {
      params,
    });

    return res.data.items;
  },
  post: async (data: Department) => {
    const res = await fetch("/api/departments", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: Department) => {
    const res = await fetch("/api/departments", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: Department) => {
    await fetch("/api/departments", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
