import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { CategoryApprovalSettings } from "@/domain/serviceDesk";

import { MAX_APPROVAL_STEP_PER_CATEGORY } from "./constnats";
import type { ApprovalStepData, CategoryApprovalStepData } from "./types";

export function mapApprovalData(
  approvalStepData: CategoryApprovalSettings[],
): CategoryApprovalStepData[] {
  return approvalStepData.map((cat) => ({
    ...cat,
    id: `category:${cat.id}`,
    categoryId: cat.id,
    nodeType: "category",
    approvalSteps: cat.approvalSteps.map((approvalStep) => ({
      ...approvalStep,
      id: `approval:${approvalStep.id}`,
      approvalId: approvalStep.id,
      nodeType: "approvalStep",
    })),
  }));
}

export const approvalStepToTree = (
  categories: CategoryApprovalStepData[],
): TreeNodes<CategoryApprovalStepData | ApprovalStepData> => {
  return categories.map((cat) => ({
    id: cat.id,
    data: cat,
    collapsed: false,
    maximum: MAX_APPROVAL_STEP_PER_CATEGORY,
    children:
      cat.approvalSteps.map((approval) => ({
        id: approval.id,
        data: approval,
        children: [],
      })) ?? [],
  }));
};
