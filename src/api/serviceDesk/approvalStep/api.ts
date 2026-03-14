import client from "@/api/client";
import { ApprovalStep, CategoryApprovalSettings } from "@/domain/serviceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type ApprovalStepResponse = OResponse<CategoryApprovalSettings>;

// feature-scoped API.
export const serviceDeskApprovalStepApi = {
  list: async (params: DbParams): Promise<CategoryApprovalSettings[]> => {
    if (!params) return [];

    const res = await client.api.get<ApprovalStepResponse>(
      `/api/service-desk/approval-steps`,
      { params },
    );
    return res.data.items;
  },

  get: async (id: string | number): Promise<ApprovalStep | null> => {
    if (!id) return null;

    const res = await client.api.get<ApprovalStep>(
      `/api/service-desk/approval-steps/${id}`,
    );
    return res.data;
  },

  create: async (data: ApprovalStep) => {
    const res = await client.api.post<ApprovalStep>(
      `/api/service-desk/approval-steps`,
      data,
    );
    return res.data;
  },

  update: async (data: ApprovalStep) => {
    const res = await client.api.put(
      `/api/service-desk/approval-steps/${data.id}`,
      data,
    );
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/approval-steps/${id}`);
    return null;
  },
};
