import { ApprovalStep, CategoryApprovalSettings } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskApprovalStepTreePayload,
  ServiceDeskApprovalStepListParams,
} from "@/feature/serviceDesk/approvalStep/types";
import client from "@/lib/api";
import { OResponse } from "@/shared/types/api";

import type { CreateApprovalStepInput, UpdateApprovalStepInput } from "./write";

type ApprovalStepResponse = OResponse<CategoryApprovalSettings>;

// feature-scoped API.
export const serviceDeskApprovalStepApi = {
  list: async (
    params?: ServiceDeskApprovalStepListParams,
  ): Promise<CategoryApprovalSettings[]> => {
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

  create: async (data: CreateApprovalStepInput) => {
    const res = await client.api.post<ApprovalStep>(
      `/api/service-desk/approval-steps`,
      data,
    );
    return res.data;
  },

  update: async (data: UpdateApprovalStepInput) => {
    const res = await client.api.put<ApprovalStep>(
      `/api/service-desk/approval-steps/${data.id}`,
      data,
    );
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/approval-steps/${id}`);
    return null;
  },

  saveTree: async (
    payload: SaveServiceDeskApprovalStepTreePayload,
  ): Promise<CategoryApprovalSettings[]> => {
    const res = await client.api.put<CategoryApprovalSettings[]>(
      `/api/service-desk/approval-steps`,
      payload,
    );

    return res.data;
  },
};
