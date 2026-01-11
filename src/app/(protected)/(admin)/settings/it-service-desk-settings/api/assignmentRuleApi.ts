// src/app/(protected)/settings/it-service-desk-settings/api/assignmentRuleApi.ts
import { AssignmentRule } from "@/feature/it-service-desk/types";

export const itServiceDeskAssignmentRuleApi = {
  post: async (data: AssignmentRule) => {
    const res = await fetch("/api/it-service-desk/assignment-rule", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: AssignmentRule) => {
    const res = await fetch("/api/it-service-desk/assignment-rule", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: AssignmentRule) => {
    await fetch("/api/it-service-desk/assignment-rule", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
