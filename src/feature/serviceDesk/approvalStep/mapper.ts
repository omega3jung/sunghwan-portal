import {
  ApprovalAssigneeType,
  ApprovalStep,
  CategoryApprovalSettings,
} from "@/domain/serviceDesk";
import {
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { ArrayMapper, Mapper } from "@/shared/types";
import { nullToUndefined } from "@/shared/utils/value";

import {
  DbApprovalAssigneeType,
  DbApprovalStep,
  DbCategoryApprovalSettings,
} from "./types";

export const camelCategoryApprovalSettingMapper: ArrayMapper<
  DbCategoryApprovalSettings,
  CategoryApprovalSettings
> = (data) => {
  return data.map((item) => ({
    id: item.category_id.toString(),
    name: item.category_name,
    description: nullToUndefined(item.category_description),
    index: item.category_index,
    active: item.category_active,
    scope: item.category_scope,
    defaultPriority: item.default_priority,
    defaultRiskLevel: item.default_risk_level,
    defaultSlaDays: item.default_sla_days,
    approvalSteps: camelApprovalStepMapper(item.approval_step),
  }));
};

export const camelApprovalStepMapper: ArrayMapper<
  DbApprovalStep,
  ApprovalStep
> = (data) => {
  return data.map((item) => ({
    id: item.approval_step_id.toString(),
    name: item.approval_step_name,
    description: nullToUndefined(item.approval_step_description),
    index: item.approval_step_index,
    categoryId: item.category_id.toString(),
    stepAssignee: camelAssigneeTypeMapper(item.approval_step_assignee),
    skipAccessLevel: nullToUndefined(item.skip_access_level),
  }));
};

const camelAssigneeTypeMapper: Mapper<
  DbApprovalAssigneeType,
  ApprovalAssigneeType
> = (data) => {
  switch (data.type) {
    case "MANAGER":
      return { type: data.type, level: data.level };
    case "DEPARTMENT":
      return { type: data.type, departmentId: data.department_id.toString() };
    case "JOB_FIELD":
      return { type: data.type, jobFieldId: data.field_id.toString() };
    case "EMPLOYEE":
      return {
        type: data.type,
        employeeUsernames: data.employee_username.map((employeeUsername) =>
          String(employeeUsername),
        ),
      };
  }
};

export const mapApprovalSettingsListPayload = createListPayloadMapper(
  camelCategoryApprovalSettingMapper,
);

export const mapApprovalSettingsTreePayload = (payload: unknown) => {
  if (!Array.isArray(payload)) {
    return payload;
  }

  return camelCategoryApprovalSettingMapper(
    payload as DbCategoryApprovalSettings[],
  );
};
