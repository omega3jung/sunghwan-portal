import client from "@/api/client";
import { AssignmentRule } from "@/domain/serviceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type AssignmentRuleResponse = OResponse<AssignmentRule>;

// feature-scoped API.
export const serviceDeskAssignmentRuleApi = {
  fetch: async (params: DbParams): Promise<AssignmentRule[]> => {
    if (!params) return [];

    const res = await client.api.get<AssignmentRuleResponse>(
      "/api/service-desk/assignment-rules",
      { params },
    );

    return res.data.items;
  },

  post: async (data: AssignmentRule) => {
    const res = await fetch("/api/service-desk/assignment-rules", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: AssignmentRule) => {
    const res = await fetch("/api/service-desk/assignment-rules", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  delete: async (data: AssignmentRule) => {
    await fetch("/api/service-desk/assignment-rules", {
      method: "DELETE",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return null;
  },
};
