import client from "@/api/client";
import { AssignmentRule } from "@/domain/serviceDesk";
import { DbParams, OResponse } from "@/shared/types/api";

type AssignmentRuleResponse = OResponse<AssignmentRule>;

// feature-scoped API.
export const serviceDeskAssignmentRuleApi = {
  list: async (params: DbParams): Promise<AssignmentRule[]> => {
    if (!params) return [];

    const res = await client.api.get<AssignmentRuleResponse>(
      `/api/service-desk/assignment-rules`,
      { params },
    );
    return res.data.items;
  },

  get: async (id: string | number): Promise<AssignmentRule | null> => {
    if (!id) return null;

    const res = await client.api.get<AssignmentRule>(
      `/api/service-desk/assignment-rules/${id}`,
    );
    return res.data;
  },

  create: async (data: AssignmentRule) => {
    const res = await client.api.post<AssignmentRule>(
      `/api/service-desk/assignment-rules`,
      data,
    );
    return res.data;
  },

  update: async (data: AssignmentRule) => {
    const res = await client.api.put(
      `/api/service-desk/assignment-rules/${data.categoryId}`,
      data,
    );
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/assignment-rules/${id}`);
    return null;
  },
};
