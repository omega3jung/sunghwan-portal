import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import type {
  CategoryApprovalSettings,
  TenantCategoryTree,
} from "@/domain/serviceDesk";

import { MAX_APPROVAL_STEP_PER_CATEGORY } from "../constants";
import type { ApprovalStepData, CategoryApprovalStepData } from "../types";

export function mapApprovalData(
  categories: TenantCategoryTree[],
  tenantId: string,
  approvalStepData: CategoryApprovalSettings[],
): CategoryApprovalStepData[] {
  if (!categories.length) {
    return [];
  }

  const currentTenant = categories.find((category) => category.id === tenantId);

  if (!currentTenant) {
    return [];
  }

  const approvalStepMap = new Map(
    approvalStepData.map((category) => [category.id, category.approvalSteps]),
  );

  return currentTenant.categories
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((category) => ({
      ...category,
      id: `category:${category.id}`,
      categoryId: category.id,
      nodeType: "category" as const,
      approvalSteps: (approvalStepMap.get(category.id) ?? [])
        .slice()
        .sort((left, right) => left.index - right.index)
        .map((approvalStep) => ({
          ...approvalStep,
          id: `approval:${approvalStep.id}`,
          approvalId: approvalStep.id,
          nodeType: "approvalStep" as const,
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
