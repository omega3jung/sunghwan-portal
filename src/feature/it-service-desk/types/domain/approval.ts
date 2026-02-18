import { AccessLevel, Locale } from "@/types";

import { Category } from "./category";

// category data structure.
export type CategoryApprovalSettings = Category & {
  approvalSteps: ApprovalStep[];
};

export interface ApprovalStep {
  id: string; // string number. can use parseInt.
  index: number;

  categoryId: string; // string number. can use parseInt.
  stepAssignee: ApprovalAssigneeType;

  /**
   * If requester's access level is greater than or equal to this value,
   * this approval step will be skipped.
   */
  skipAccessLevel?: AccessLevel;
  translations?: ApprovalStepTranslations; // default language : en
}

export const APPROVAL_ASSIGNEE_TYPES = [
  "UPPER_MANAGER",
  "DEPARTMENT",
  "ROLE",
  "EMPLOYEE",
] as const;

export type ApprovalAssigneeTypeValue =
  (typeof APPROVAL_ASSIGNEE_TYPES)[number];

export type ApprovalAssigneePayloadMap = {
  UPPER_MANAGER: { level: 1 | 2 };
  DEPARTMENT: { departmentId: string }; // string number. can use parseInt.
  ROLE: { roleCode: string }; // string number. can use parseInt.
  EMPLOYEE: { employeeIds: string[] }; // string number. can use parseInt.
};

export type ApprovalAssigneeType = {
  [K in ApprovalAssigneeTypeValue]: {
    type: K;
  } & ApprovalAssigneePayloadMap[K];
}[ApprovalAssigneeTypeValue];

interface ApprovalStepI18n {
  name: string;
  description?: string;
}

export type ApprovalStepTranslations = Partial<
  Record<Locale, ApprovalStepI18n>
>;
