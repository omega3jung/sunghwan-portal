import client from "@/api/client";
import { JobField } from "@/domain/organization";
import { DbParams, OResponse } from "@/shared/types/api";

type JobFieldResponse = OResponse<JobField>;

export const jobFieldApi = {
  list: async (params: DbParams): Promise<JobField[]> => {
    if (!params) return [];

    const res = await client.api.get<JobFieldResponse>("/api/job-fields", {
      params,
    });

    return res.data.items;
  },

  get: async (id: string | number): Promise<JobField | null> => {
    if (!id) return null;

    const res = await client.api.get<JobField>(`/api/job-fields/${id}`);
    return res.data;
  },

  create: async (data: JobField) => {
    const res = await client.api.post(`/api/job-fields`, data);
    return res.data;
  },

  update: async (data: JobField) => {
    const res = await client.api.put(`/api/job-fields/${data.id}`, data);
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/job-fields/${id}`);
    return null;
  },
};
