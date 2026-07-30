import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import type {
  CategoryApprovalSettings,
  TenantCategoryTree,
} from "@/domain/serviceDesk";

import { MAX_APPROVAL_STEP_PER_CATEGORY } from "../constants";
import type { ApprovalStepData, CategoryApprovalStepData } from "../types";

export function createApprovalStepTree(
  categories: TenantCategoryTree[],
  tenantId: string,
  approvalSettings: CategoryApprovalSettings[],
): TreeNodes<CategoryApprovalStepData | ApprovalStepData> {
  const currentTenant = categories.find((tenant) => tenant.id === tenantId);

  if (!currentTenant) {
    return [];
  }

  const approvalStepMap = new Map(
    approvalSettings.map((category) => [
      category.id,
      category.approvalSteps,
    ]),
  );

  return currentTenant.categories
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((category) => {
      const { subCategories: _subCategories, ...categoryData } = category;

      return {
        id: `category:${category.id}`,
        data: {
          ...categoryData,
          id: `category:${category.id}`,
          categoryId: category.id,
          nodeType: "category" as const,
        },
        collapsed: false,
        maximum: MAX_APPROVAL_STEP_PER_CATEGORY,
        children: (approvalStepMap.get(category.id) ?? [])
          .slice()
          .sort((left, right) => left.index - right.index)
          .map((approvalStep) => ({
            id: `approval:${approvalStep.id}`,
            data: {
              ...approvalStep,
              id: `approval:${approvalStep.id}`,
              approvalId: approvalStep.id,
              nodeType: "approvalStep" as const,
            },
            children: [],
          })),
      };
    });
}
