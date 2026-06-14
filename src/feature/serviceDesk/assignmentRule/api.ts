import { AssignmentRule } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskAssignmentRuleTreePayload,
  ServiceDeskAssignmentRuleListParams,
} from "@/feature/serviceDesk/assignmentRule/types";
import client from "@/lib/api";
import { OResponse } from "@/shared/types/api";

type AssignmentRuleResponse = OResponse<AssignmentRule>;

// feature-scoped API.
export const serviceDeskAssignmentRuleApi = {
  list: async (
    params?: ServiceDeskAssignmentRuleListParams,
  ): Promise<AssignmentRule[]> => {
    if (!params) return [];

    const res = await client.api.get<AssignmentRuleResponse>(
      `/api/service-desk/assignment-rules`,
      { params },
    );
    return res.data.items;
  },

  saveTree: async (
    payload: SaveServiceDeskAssignmentRuleTreePayload,
  ): Promise<AssignmentRule[]> => {
    const res = await client.api.put<AssignmentRule[]>(
      `/api/service-desk/assignment-rules`,
      payload,
    );

    return res.data;
  },
};
