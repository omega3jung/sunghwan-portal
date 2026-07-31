import type { AssigneeGroup, CategoryScope } from "@/domain/serviceDesk";
import type { DbParams } from "@/shared/types/api";

// back-end data structures.
export interface DbAssigneeGroup {
  job_field_id: number[]; // string number. can use parseInt.
  employee_username: string[];
  include_tenant_company?: boolean;
}

/** Database-facing assignment rule shape used by the Service Desk application boundary. */
export interface DbAssignmentRule {
  category_id: number; // string number. can use parseInt.
  assignee: DbAssigneeGroup;
}

/** Parameters that configure service desk assignment rule list behavior in the Service Desk application boundary. */
export type ServiceDeskAssignmentRuleListParams = DbParams & {
  tenantId?: string;
  settings?: boolean;
  context?: "settings";
  scope?: CategoryScope;
};

/** Input contract for assignment rule tree sync sub category operations at the Service Desk application boundary. */
export type AssignmentRuleTreeSyncSubCategoryInput = {
  id: string;
  assignee: AssigneeGroup;
};

/** Input contract for assignment rule tree sync category operations at the Service Desk application boundary. */
export type AssignmentRuleTreeSyncCategoryInput = {
  id: string;
  assignee: AssigneeGroup;
  subCategories: AssignmentRuleTreeSyncSubCategoryInput[];
};

/** Represents save service desk assignment rule tree payload within the Service Desk application boundary. */
export type SaveServiceDeskAssignmentRuleTreePayload = {
  tenantId: string;
  categories: AssignmentRuleTreeSyncCategoryInput[];
};
