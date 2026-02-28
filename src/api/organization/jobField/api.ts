import client from "@/api/client";
import { JobField } from "@/domain/organization";
import { DbParams, OResponse } from "@/shared/types/api";

type JobFieldResponse = OResponse<JobField>;

export const jobFieldApi = {
  fetch: async (params: DbParams): Promise<JobField[]> => {
    if (!params) return [];

    const res = await client.api.get<JobFieldResponse>("/api/job-fields", {
      params,
    });

    return res.data.items;
  },
  post: async (data: JobField) => {
    const res = await fetch("/api/job-fields", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: JobField) => {
    const res = await fetch("/api/job-fields", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: JobField) => {
    await fetch("/api/job-fields", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
