import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

import { MainCategory } from "../category/model";

// category data structure.
export type CategoryApprovalSettings = Omit<MainCategory, "subCategories"> & {
  approvalSteps: ApprovalStep[];
};

export interface ApprovalStep {
  id: string; // string number. can use parseInt.
  name: LocalizedText;
  description?: LocalizedText;
  index: number;

  categoryId: string; // string number. can use parseInt.
  stepAssignee: ApprovalAssigneeType;

  /**
   * If requester's access level is greater than or equal to this value,
   * this approval step will be skipped.
   */
  skipAccessLevel?: AccessLevel;
}

export const APPROVAL_ASSIGNEE_TYPES = [
  "MANAGER",
  "DEPARTMENT",
  "JOB_FIELD",
  "EMPLOYEE",
] as const;

export type ApprovalAssigneeTypeValue =
  (typeof APPROVAL_ASSIGNEE_TYPES)[number];

export type ApprovalAssigneePayloadMap = {
  MANAGER: { level: 1 | 2 };
  DEPARTMENT: { departmentId: string }; // string number. can use parseInt.
  JOB_FIELD: { jobFieldId: string }; // string number. can use parseInt.
  EMPLOYEE: { employeeIds: string[] }; // employee userName identifiers
};

export type ApprovalAssigneeType = {
  [K in ApprovalAssigneeTypeValue]: {
    type: K;
  } & ApprovalAssigneePayloadMap[K];
}[ApprovalAssigneeTypeValue];

export type AssigneeByType<T extends ApprovalAssigneeTypeValue> = Extract<
  ApprovalAssigneeType,
  { type: T }
>;
