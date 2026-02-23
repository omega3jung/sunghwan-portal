import { AccessLevel } from "@/domain/auth";
import {
  ApprovalAssigneeType,
  ApprovalStep,
  CategoryApprovalSettings,
} from "@/domain/itServiceDesk";
import { ArrayMapper, Locale, LocalizedText, Mapper } from "@/shared/types";

import { DbCategory } from "../category/mapper";

// back-end data structures.
export type DbCategoryApprovalSettings = DbCategory & {
  approval_step: DbApprovalStep[];
};

export interface DbApprovalStep {
  approval_step_id: string; // string number. can use parseInt.
  approval_step_name: LocalizedText;
  approval_step_description?: LocalizedText;
  approval_step_index: number;

  category_id: string; // string number. can use parseInt.
  approval_step_assignee: DbApprovalAssigneeType;

  /**
   * If requester's access level is greater than or equal to this value,
   * this approval step will be skipped.
   */
  skip_access_level?: AccessLevel;
  translation?: DbApprovalStepTranslations; // default language : en
}

type DbApprovalAssigneeType =
  | {
      type: "MANAGER";
      level: 1 | 2;
    }
  | {
      type: "DEPARTMENT";
      department_id: string; // string number. can use parseInt.
    }
  | {
      type: "JOB_FIELD";
      field_id: string; // string number. can use parseInt.
    }
  | {
      type: "EMPLOYEE";
      employee_id: string[]; // string number. can use parseInt.
    };

export interface DbApprovalStepI18n {
  step_name: string;
  step_description?: string;
}

type DbApprovalStepTranslations = Partial<Record<Locale, DbApprovalStepI18n>>;

export const camelCategoryApprovalSettingMapper: ArrayMapper<
  DbCategoryApprovalSettings,
  CategoryApprovalSettings
> = (data) => {
  return data.map((item) => ({
    id: item.category_id,
    name: item.category_name,
    description: item.category_description,
    index: item.category_index,
    agents: item.category_agent,
    active: item.category_active,
    approvalSteps: camelApprovalStepMapper(item.approval_step),
  }));
};

export const camelApprovalStepMapper: ArrayMapper<
  DbApprovalStep,
  ApprovalStep
> = (data) => {
  return data.map((item) => ({
    id: item.approval_step_id,
    name: item.approval_step_name,
    approval_step_description: item.approval_step_description,
    index: item.approval_step_index,
    categoryId: item.category_id,
    stepAssignee: camelAssigneeTypeMapper(item.approval_step_assignee),
    skipAccessLevel: item.skip_access_level,
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
      return { type: data.type, departmentId: data.department_id };
    case "JOB_FIELD":
      return { type: data.type, jobFieldId: data.field_id };
    case "EMPLOYEE":
      return { type: data.type, employeeIds: data.employee_id };
  }
};

export const snakeApprovalStepMapper: ArrayMapper<
  ApprovalStep,
  DbApprovalStep
> = (data) => {
  return data.map((item) => ({
    approval_step_id: item.id,
    approval_step_name: item.name,
    approval_step_description: item.description,
    approval_step_index: item.index,
    category_id: item.categoryId,
    approval_step_assignee: snakeAssigneeTypeMapper(item.stepAssignee),
    skip_access_level: item.skipAccessLevel,
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
      return { type: data.type, department_id: data.departmentId };
    case "JOB_FIELD":
      return { type: data.type, field_id: data.jobFieldId };
    case "EMPLOYEE":
      return { type: data.type, employee_id: data.employeeIds };
  }
};
