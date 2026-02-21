import fetcher from "@/services/fetcher";
import { DbParams, OResponse } from "@/shared/types/api";

import { AssignmentRule } from "./types";

type AssignmentRuleResponse = OResponse<AssignmentRule>;

export const itServiceDeskAssignmentRuleApi = {
  fetch: async (params: DbParams): Promise<AssignmentRule[]> => {
    if (!params) return [];

    const res = await fetcher.api.get<AssignmentRuleResponse>(
      "/api/it-service-desk/assignment-rule",
      { params },
    );

    return res.data.items;
  },

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
