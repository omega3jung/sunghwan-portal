import { AssignmentRule } from "@/domain/serviceDesk";
import {
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { ArrayMapper } from "@/shared/types";

import { DbAssignmentRule } from "./assignmentRule";

/** Maps a database assignment rule record into the application-facing model. */
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

/** Maps a assignment rule collection payload into application models. */
export const mapAssignmentRuleListPayload = createListPayloadMapper(
  camelAssignmentRuleMapper,
);

/** Maps a assignment rule tree payload into the application model. */
export const mapAssignmentRuleTreePayload = (payload: unknown) => {
  if (!Array.isArray(payload)) {
    return payload;
  }

  return camelAssignmentRuleMapper(payload as DbAssignmentRule[]);
};
