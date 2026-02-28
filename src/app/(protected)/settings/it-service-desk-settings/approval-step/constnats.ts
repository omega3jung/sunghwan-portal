import { ACCESS_LEVEL } from "@/domain/auth";
import {
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
} from "@/domain/itServiceDesk";

import { ApprovalStepData } from "./types";

export const MAX_APPROVAL_STEP_PER_CATEGORY = 5;
export const MAX_ASSIGNEE_PER_APPROVAL = 10;

export const getDefaultApprovalData = (
  categoryId: string,
  count: number,
): ApprovalStepData => {
  return {
    id: `newApproval:${count}`,
    approvalId: `${count}`,
    name: { en: `New Step ${count}` },
    index: 1,
    categoryId: categoryId,
    stepAssignee: {
      type: "MANAGER",
      level: 1,
    },
    skipAccessLevel: ACCESS_LEVEL.MANAGER,
    nodeType: "approvalStep",
  };
};

export const getDefaultAssigneePayload = (
  type: ApprovalAssigneeTypeValue,
): ApprovalAssigneeType => {
  switch (type) {
    case "MANAGER":
      return { type, level: 1 };
    case "DEPARTMENT":
      return { type, departmentId: "" };
    case "JOB_FIELD":
      return { type, jobFieldId: "" };
    case "EMPLOYEE":
      return { type, employeeIds: [] };
  }
};
