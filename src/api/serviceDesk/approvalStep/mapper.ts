import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/api/utils/payload";
import { AccessLevel } from "@/domain/auth";
import {
  ApprovalAssigneeType,
  ApprovalStep,
  CategoryApprovalSettings,
} from "@/domain/serviceDesk";
import { ArrayMapper, LocalizedText, Mapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

import { DbCategory } from "../category/mapper";

// back-end data structures.
export type DbCategoryApprovalSettings = Omit<DbCategory, "sub_category"> & {
  approval_step: DbApprovalStep[];
};

export interface DbApprovalStep {
  approval_step_id: number; // string number. can use parseInt.
  approval_step_name: LocalizedText;
  approval_step_description: LocalizedText | null;
  approval_step_index: number;
  approval_step_active?: boolean;

  category_id: number; // string number. can use parseInt.
  approval_step_assignee: DbApprovalAssigneeType;

  /**
   * If requester's access level is greater than or equal to this value,
   * this approval step will be skipped.
   */
  skip_access_level: AccessLevel | null;
}

type DbApprovalAssigneeType =
  | {
      type: "MANAGER";
      level: 1 | 2;
    }
  | {
      type: "DEPARTMENT";
      department_id: number; // string number. can use parseInt.
    }
  | {
      type: "JOB_FIELD";
      field_id: number; // string number. can use parseInt.
    }
  | {
      type: "EMPLOYEE";
      employee_id: string[];
    };

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
  return data.flatMap((item) => {
    if (!item || item.approval_step_active === false) {
      return [];
    }

    return [
      {
        id: item.approval_step_id.toString(),
        name: item.approval_step_name,
        description: nullToUndefined(item.approval_step_description),
        index: item.approval_step_index,
        categoryId: item.category_id.toString(),
        stepAssignee: camelAssigneeTypeMapper(item.approval_step_assignee),
        skipAccessLevel: nullToUndefined(item.skip_access_level),
      },
    ];
  });
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
        employeeIds: data.employee_id.map((employeeId) => String(employeeId)),
      };
  }
};

export const snakeApprovalStepMapper: ArrayMapper<
  ApprovalStep,
  DbApprovalStep
> = (data) => {
  return data.map((item) => ({
    approval_step_id: parseInt(item.id),
    approval_step_name: item.name,
    approval_step_description: undefinedToNull(item.description),
    approval_step_index: item.index,
    category_id: parseInt(item.categoryId),
    approval_step_assignee: snakeAssigneeTypeMapper(item.stepAssignee),
    skip_access_level: undefinedToNull(item.skipAccessLevel),
  }));
};

const snakeAssigneeTypeMapper: Mapper<
  ApprovalAssigneeType,
  DbApprovalAssigneeType
> = (data) => {
  switch (data.type) {
    case "MANAGER":
      return { type: data.type, level: data.level };
    case "DEPARTMENT":
      return { type: data.type, department_id: parseInt(data.departmentId) };
    case "JOB_FIELD":
      return { type: data.type, field_id: parseInt(data.jobFieldId) };
    case "EMPLOYEE":
      return {
        type: data.type,
        employee_id: data.employeeIds,
      };
  }
};

export const mapApprovalSettingsListPayload = createListPayloadMapper(
  camelCategoryApprovalSettingMapper,
);
export const mapApprovalStepItemPayload = createItemPayloadMapper(
  camelApprovalStepMapper,
);

export const mapApprovalSettingsTreePayload = (payload: unknown) => {
  if (!Array.isArray(payload)) {
    return payload;
  }

  return camelCategoryApprovalSettingMapper(payload as DbCategoryApprovalSettings[]);
};
