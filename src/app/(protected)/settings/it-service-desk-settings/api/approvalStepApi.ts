// src/app/(protected)/settings/it-service-desk-settings/api/approvalStepApi.ts
import { ApprovalStep } from "@/feature/it-service-desk/types";

export const itServiceDeskApprovalStepApi = {
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
