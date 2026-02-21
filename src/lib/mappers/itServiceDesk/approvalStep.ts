import { AccessLevel } from "@/domain/auth";
import { Locale } from "@/domain/config";
import {
  ApprovalAssigneeType,
  ApprovalStep,
  ApprovalStepTranslations,
  CategoryApprovalSettings,
} from "@/feature/itServiceDesk";

import { ArrayMapper, Mapper } from "../utils";
import {
  camelTranslationMapper as camelCategoryTranslationMapper,
  DbCategory,
} from "./category";

// back-end data structures.
export type DbCategoryApprovalSettings = DbCategory & {
  approval_step: DbApprovalStep[];
};

export interface DbApprovalStep {
  approval_step_id: string; // string number. can use parseInt.
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
      type: "UPPER_MANAGER";
      level: 1 | 2;
    }
  | {
      type: "DEPARTMENT";
      department_id: string; // string number. can use parseInt.
    }
  | {
      type: "ROLE";
      role_code: string; // string number. can use parseInt.
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
    index: item.category_index,
    agents: item.category_agent,
    active: item.category_active,
    translations: camelCategoryTranslationMapper(item.category_translation),
    approvalSteps: camelApprovalStepMapper(item.approval_step),
  }));
};

export const camelApprovalStepMapper: ArrayMapper<
  DbApprovalStep,
  ApprovalStep
> = (data) => {
  return data.map((item) => ({
    id: item.approval_step_id,
    index: item.approval_step_index,
    categoryId: item.category_id,
    stepAssignee: camelAssigneeTypeMapper(item.approval_step_assignee),
    skipAccessLevel: item.skip_access_level,
    translations: camelTranslationMapper(item.translation),
  }));
};

const camelAssigneeTypeMapper: Mapper<
  DbApprovalAssigneeType,
  ApprovalAssigneeType
> = (data) => {
  switch (data.type) {
    case "UPPER_MANAGER":
      return { type: data.type, level: data.level };
    case "DEPARTMENT":
      return { type: data.type, departmentId: data.department_id };
    case "ROLE":
      return { type: data.type, roleCode: data.role_code };
    case "EMPLOYEE":
      return { type: data.type, employeeIds: data.employee_id };
  }
};

const camelTranslationMapper: Mapper<
  DbApprovalStepTranslations | undefined,
  ApprovalStepTranslations | undefined
> = (data) => {
  if (!data) return undefined;

  return Object.fromEntries(
    Object.entries(data).map(([locale, value]) => [
      locale,
      {
        name: value.step_name,
        description: value.step_description,
      },
    ]),
  ) as ApprovalStepTranslations;
};

export const snakeApprovalStepMapper: ArrayMapper<
  ApprovalStep,
  DbApprovalStep
> = (data) => {
  return data.map((item) => ({
    approval_step_id: item.id,
    approval_step_index: item.index,
    category_id: item.categoryId,
    approval_step_assignee: snakeAssigneeTypeMapper(item.stepAssignee),
    skip_access_level: item.skipAccessLevel,
    translation: snakeTranslationMapper(item.translations),
  }));
};

const snakeAssigneeTypeMapper: Mapper<
  ApprovalAssigneeType,
  DbApprovalAssigneeType
> = (data) => {
  switch (data.type) {
    case "UPPER_MANAGER":
      return { type: data.type, level: data.level };
    case "DEPARTMENT":
      return { type: data.type, department_id: data.departmentId };
    case "ROLE":
      return { type: data.type, role_code: data.roleCode };
    case "EMPLOYEE":
      return { type: data.type, employee_id: data.employeeIds };
  }
};

const snakeTranslationMapper: Mapper<
  ApprovalStepTranslations | undefined,
  DbApprovalStepTranslations | undefined
> = (data) => {
  if (!data) return undefined;

  return Object.fromEntries(
    Object.entries(data).map(([locale, value]) => [
      locale,
      {
        step_name: value.name,
        step_description: value.description,
      },
    ]),
  ) as DbApprovalStepTranslations;
};
