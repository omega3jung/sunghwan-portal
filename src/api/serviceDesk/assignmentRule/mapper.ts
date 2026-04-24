import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/api/utils/payload";
import { AssignmentRule } from "@/domain/serviceDesk";
import { ArrayMapper } from "@/shared/types";

// back-end data structures.
export interface DbAssigneeGroup {
  job_field_id: number[]; // string number. can use parseInt.
  employee_id: string[];
}

export interface DbAssignmentRule {
  category_id: number; // string number. can use parseInt.
  assignee: DbAssigneeGroup;
}

export const camelAssignmentRuleMapper: ArrayMapper<
  DbAssignmentRule,
  AssignmentRule
> = (data) => {
  return data.map((item) => ({
    categoryId: item.category_id.toString(),
    assignee: {
      jobFieldIds: item.assignee.job_field_id.map((id) => id.toString()),
      employeeIds: item.assignee.employee_id.map((id) => String(id)),
    },
  }));
};

export const snakeAssignmentRuleMapper: ArrayMapper<
  AssignmentRule,
  DbAssignmentRule
> = (data) => {
  return data.map((item) => ({
    category_id: parseInt(item.categoryId),
    assignee: {
      job_field_id: item.assignee.jobFieldIds.map((id) => parseInt(id)),
      employee_id: item.assignee.employeeIds,
    },
  }));
};

export const mapAssignmentRuleListPayload = createListPayloadMapper(
  camelAssignmentRuleMapper,
);
export const mapAssignmentRuleItemPayload = createItemPayloadMapper(
  camelAssignmentRuleMapper,
);

export const mapAssignmentRuleTreePayload = (payload: unknown) => {
  if (!Array.isArray(payload)) {
    return payload;
  }

  return camelAssignmentRuleMapper(payload as DbAssignmentRule[]);
};
