import type { AssigneeGroup } from "@/domain/serviceDesk";
import type { DbParams } from "@/shared/types/api";

// back-end data structures.
export interface DbAssigneeGroup {
  job_field_id: number[]; // string number. can use parseInt.
  employee_username: string[];
}

export interface DbAssignmentRule {
  category_id: number; // string number. can use parseInt.
  assignee: DbAssigneeGroup;
}

export type ServiceDeskAssignmentRuleListParams = DbParams & {
  tenantId?: string;
};

export type AssignmentRuleTreeSyncSubCategoryInput = {
  id: string;
  assignee: AssigneeGroup;
};

export type AssignmentRuleTreeSyncCategoryInput = {
  id: string;
  assignee: AssigneeGroup;
  subCategories: AssignmentRuleTreeSyncSubCategoryInput[];
};

export type SaveServiceDeskAssignmentRuleTreePayload = {
  tenantId: string;
  categories: AssignmentRuleTreeSyncCategoryInput[];
};
