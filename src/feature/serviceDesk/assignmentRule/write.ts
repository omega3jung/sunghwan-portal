import { AssignmentRule } from "@/domain/serviceDesk";

import { DbAssignmentRule } from "./types";

export type AssignmentRuleWriteFields = {
  categoryId: string;
  assignee: {
    jobFieldIds: string[];
    assigneeUsernames: string[];
  };
};

export type CreateAssignmentRuleInput = AssignmentRuleWriteFields;
export type UpdateAssignmentRuleInput = AssignmentRuleWriteFields & {
  id?: string;
};

export function toAssignmentRuleWritePayload(
  input: CreateAssignmentRuleInput | UpdateAssignmentRuleInput,
): DbAssignmentRule {
  return {
    category_id: Number(input.categoryId),
    assignee: {
      job_field_id: input.assignee.jobFieldIds.map(Number),
      employee_username: input.assignee.assigneeUsernames,
    },
  };
}

export function toAssignmentRuleMockResource(
  input: CreateAssignmentRuleInput | UpdateAssignmentRuleInput,
): AssignmentRule {
  return {
    categoryId: input.categoryId,
    assignee: {
      jobFieldIds: input.assignee.jobFieldIds,
      assigneeUsernames: input.assignee.assigneeUsernames,
    },
  };
}
