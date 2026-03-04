import client from "@/api/client";
import { ApprovalStep, CategoryApprovalSettings } from "@/domain/serviceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type ApprovalStepResponse = OResponse<CategoryApprovalSettings>;

// feature-scoped API.
export const serviceDeskApprovalStepApi = {
  fetch: async (params: DbParams): Promise<CategoryApprovalSettings[]> => {
    if (!params) return [];

    const res = await client.api.get<ApprovalStepResponse>(
      "/api/service-desk/approval-steps",
      { params },
    );

    return res.data.items;
  },

  post: async (data: ApprovalStep) => {
    const res = await fetch("/api/service-desk/approval-steps", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: ApprovalStep) => {
    const res = await fetch("/api/service-desk/approval-steps", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: ApprovalStep) => {
    await fetch("/api/service-desk/approval-steps", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
