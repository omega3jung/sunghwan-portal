import { AssignmentRule } from "@/domain/serviceDesk";
import {
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { ArrayMapper } from "@/shared/types";

import { DbAssignmentRule } from "./assignmentRule";

export const camelAssignmentRuleMapper: ArrayMapper<
  DbAssignmentRule,
  AssignmentRule
> = (data) => {
  return data.map((item) => ({
    categoryId: item.category_id.toString(),
    assignee: {
      jobFieldIds: item.assignee.job_field_id.map((id) => id.toString()),
      assigneeUsernames: item.assignee.employee_username.map((id) =>
        String(id),
      ),
      includeTenantCompany: item.assignee.include_tenant_company === true,
    },
  }));
};

export const mapAssignmentRuleListPayload = createListPayloadMapper(
  camelAssignmentRuleMapper,
);

export const mapAssignmentRuleTreePayload = (payload: unknown) => {
  if (!Array.isArray(payload)) {
    return payload;
  }

  return camelAssignmentRuleMapper(payload as DbAssignmentRule[]);
};
