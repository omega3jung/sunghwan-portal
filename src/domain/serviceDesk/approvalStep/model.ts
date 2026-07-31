import { AccessLevel } from "@/domain/auth";
import { LocalizedText } from "@/shared/types";

import { MainCategory } from "../category/model";

// category data structure.
export type CategoryApprovalSettings = Omit<MainCategory, "subCategories"> & {
  approvalSteps: ApprovalStep[];
};

/** Represents approval step within the Service Desk domain. */
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

/** Assignee strategies supported by approval-step routing. */
export const APPROVAL_ASSIGNEE_TYPES = [
  "MANAGER",
  "DEPARTMENT",
  "JOB_FIELD",
  "EMPLOYEE",
] as const;

/** Represents approval assignee type value within the Service Desk domain. */
export type ApprovalAssigneeTypeValue =
  (typeof APPROVAL_ASSIGNEE_TYPES)[number];

/** Represents approval assignee payload map within the Service Desk domain. */
export type ApprovalAssigneePayloadMap = {
  MANAGER: { managerDistance: 1 | 2 };
  DEPARTMENT: { departmentId: string }; // string number. can use parseInt.
  JOB_FIELD: { jobFieldId: string }; // string number. can use parseInt.
  EMPLOYEE: { employeeUsernames: string[] }; // employee username identifiers
};

/** Represents approval assignee type within the Service Desk domain. */
export type ApprovalAssigneeType = {
  [K in ApprovalAssigneeTypeValue]: {
    type: K;
  } & ApprovalAssigneePayloadMap[K];
}[ApprovalAssigneeTypeValue];

/** Represents assignee by type within the Service Desk domain. */
export type AssigneeByType<T extends ApprovalAssigneeTypeValue> = Extract<
  ApprovalAssigneeType,
  { type: T }
>;
