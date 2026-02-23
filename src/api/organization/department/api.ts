import client from "@/api/client";
import { ApprovalStep, CategoryApprovalSettings } from "@/domain/itServiceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type ApprovalStepResponse = OResponse<CategoryApprovalSettings>;

export const itServiceDeskApprovalStepApi = {
  fetch: async (params: DbParams): Promise<CategoryApprovalSettings[]> => {
    if (!params) return [];

    const res = await client.api.get<ApprovalStepResponse>(
      "/api/it-service-desk/approval-step",
      { params },
    );

    return res.data.items;
  },
  post: async (data: ApprovalStep) => {
    const res = await fetch("/api/it-service-desk/approvalStep", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: ApprovalStep) => {
    const res = await fetch("/api/it-service-desk/approvalStep", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: ApprovalStep) => {
    await fetch("/api/it-service-desk/approvalStep", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
