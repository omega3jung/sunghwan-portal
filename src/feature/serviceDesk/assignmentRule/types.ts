import type { AssigneeGroup } from "@/domain/serviceDesk";
import type { DbParams } from "@/shared/types/api";

export type ServiceDeskAssignmentRuleListParams = DbParams & {
  clientId?: string;
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
  clientId: string;
  categories: AssignmentRuleTreeSyncCategoryInput[];
};
