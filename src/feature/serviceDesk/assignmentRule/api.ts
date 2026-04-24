import { AssignmentRule } from "@/domain/serviceDesk";
import type {
  SaveServiceDeskAssignmentRuleTreePayload,
  ServiceDeskAssignmentRuleListParams,
} from "@/feature/serviceDesk/assignmentRule/types";
import type {
  CreateAssignmentRuleInput,
  UpdateAssignmentRuleInput,
} from "@/feature/serviceDesk/assignmentRule/write";
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

  get: async (id: string | number): Promise<AssignmentRule | null> => {
    if (!id) return null;

    const res = await client.api.get<AssignmentRule>(
      `/api/service-desk/assignment-rules/${id}`,
    );
    return res.data;
  },

  create: async (data: CreateAssignmentRuleInput) => {
    const res = await client.api.post<AssignmentRule>(
      `/api/service-desk/assignment-rules`,
      data,
    );
    return res.data;
  },

  update: async (data: UpdateAssignmentRuleInput) => {
    const id = data.id ?? data.categoryId;
    const res = await client.api.put<AssignmentRule>(
      `/api/service-desk/assignment-rules/${id}`,
      data,
    );
    return res.data;
  },

  remove: async (id: string | number) => {
    await client.api.delete(`/api/service-desk/assignment-rules/${id}`);
    return null;
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
