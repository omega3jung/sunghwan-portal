import { AssignmentRule } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskAssignmentRuleTreePayload,
  ServiceDeskAssignmentRuleListParams,
} from "@/feature/serviceDesk/assignmentRule/types";
import client from "@/lib/api";
import { OResponse } from "@/shared/types/api";
import { buildDbSearchParams } from "@/shared/utils/routing";

type AssignmentRuleResponse = OResponse<AssignmentRule>;

// feature-scoped API.
export const serviceDeskAssignmentRuleApi = {
  list: async (
    params?: ServiceDeskAssignmentRuleListParams,
  ): Promise<AssignmentRule[]> => {
    if (!params) return [];

    const searchParams = buildDbSearchParams(params);

    if (params.tenantId) {
      searchParams.set("tenantId", params.tenantId);
    }

    const res = await client.api.get<AssignmentRuleResponse, URLSearchParams>(
      `/api/service-desk/assignment-rules`,
      { params: searchParams },
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
