import type { AssigneeGroup, CategoryScope } from "@/domain/serviceDesk";
import type { DbParams } from "@/shared/types/api";

// back-end data structures.
export interface DbAssigneeGroup {
  job_field_id: number[]; // string number. can use parseInt.
  employee_username: string[];
  include_tenant_company?: boolean;
}

export interface DbAssignmentRule {
  category_id: number; // string number. can use parseInt.
  assignee: DbAssigneeGroup;
}

export type ServiceDeskAssignmentRuleListParams = DbParams & {
  tenantId?: string;
  settings?: boolean;
  context?: "settings";
  scope?: CategoryScope;
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
