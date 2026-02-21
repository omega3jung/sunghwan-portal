import { ACCESS_LEVEL } from "@/domain/auth";
import {
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
} from "@/feature/itServiceDesk";

import { ApprovalStepData } from "../types";

export const getDefaultApprovalData = (
  categoryId: string,
  count: number,
): ApprovalStepData => {
  return {
    id: `newApproval:${count}`,
    approvalId: `${count}`,
    index: 1,
    categoryId: categoryId,
    stepAssignee: {
      type: "UPPER_MANAGER",
      level: 1,
    },
    skipAccessLevel: ACCESS_LEVEL.MANAGER,
    translations: {
      en: {
        name: "Upper manager's approval",
        description: "Check to prevent duplicate issues",
      },
    },
    nodeType: "approvalStep",
    editType: "create",
  };
};

export const getDefaultAssigneePayload = (
  type: ApprovalAssigneeTypeValue,
): ApprovalAssigneeType => {
  switch (type) {
    case "UPPER_MANAGER":
      return { type, level: 1 };
    case "DEPARTMENT":
      return { type, departmentId: "" };
    case "ROLE":
      return { type, roleCode: "" };
    case "EMPLOYEE":
      return { type, employeeIds: [] };
  }
};
