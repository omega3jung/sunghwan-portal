import { ACCESS_LEVEL } from "@/domain/auth";
import {
  ApprovalAssigneeType,
  ApprovalAssigneeTypeValue,
} from "@/domain/itServiceDesk";

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
      type: "MANAGER",
      level: 1,
    },
    skipAccessLevel: ACCESS_LEVEL.MANAGER,
    translations: {
      en: {
        name: `New Step ${count}`,
        description: "",
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
