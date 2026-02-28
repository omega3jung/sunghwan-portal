import { AssignmentRule } from "@/domain/itServiceDesk";
import { ArrayMapper } from "@/shared/types";

// back-end data structures.
export interface DbAssigneeGroup {
  job_field_id: string[]; // string number. can use parseInt.
  employee_id: string[]; // string number. can use parseInt.
}

export interface DbAssignmentRule {
  category_id: string; // string number. can use parseInt.
  assignee: DbAssigneeGroup;
}

export const camelAssignmentRuleMapper: ArrayMapper<
  DbAssignmentRule,
  AssignmentRule
> = (data) => {
  return data.map((item) => ({
    categoryId: item.category_id,
    assignee: {
      jobFieldIds: item.assignee.job_field_id,
      employeeIds: item.assignee.employee_id,
    },
  }));
};

export const snakeAssignmentRuleMapper: ArrayMapper<
  AssignmentRule,
  DbAssignmentRule
> = (data) => {
  return data.map((item) => ({
    category_id: item.categoryId,
    assignee: {
      job_field_id: item.assignee.jobFieldIds,
      employee_id: item.assignee.employeeIds,
    },
  }));
};
