import { CategoryApprovalSettings } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskApprovalStepTreePayload,
  ServiceDeskApprovalStepListParams,
} from "@/lib/application/contracts/serviceDesk";
import client from "@/lib/client/api";
import { OResponse } from "@/shared/types/api";
import { buildDbSearchParams } from "@/shared/utils/routing";

type ApprovalStepResponse = OResponse<CategoryApprovalSettings>;

export const serviceDeskApprovalStepApi = {
  list: async (
    params?: ServiceDeskApprovalStepListParams,
  ): Promise<CategoryApprovalSettings[]> => {
    if (!params) return [];

    const res = await client.api.get<ApprovalStepResponse, URLSearchParams>(
      `/api/service-desk/approval-steps`,
      { params: buildDbSearchParams(params) },
    );
    return res.data.items;
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
