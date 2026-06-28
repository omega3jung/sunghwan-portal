import { CategoryApprovalSettings } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskApprovalStepTreePayload,
  ServiceDeskApprovalStepListParams,
} from "@/feature/serviceDesk/approvalStep/types";
import client from "@/lib/api";
import { OResponse } from "@/shared/types/api";
import { buildDbSearchParams } from "@/shared/utils/routing";

type ApprovalStepResponse = OResponse<CategoryApprovalSettings>;

// feature-scoped API.
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
