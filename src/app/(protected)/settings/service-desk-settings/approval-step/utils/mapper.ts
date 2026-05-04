import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import type {
  CategoryApprovalSettings,
  ClientCategoryTree,
} from "@/domain/serviceDesk";

import { MAX_APPROVAL_STEP_PER_CATEGORY } from "../constants";
import type { ApprovalStepData, CategoryApprovalStepData } from "../types";

export function mapApprovalData(
  categories: ClientCategoryTree[],
  clientId: string,
  approvalStepData: CategoryApprovalSettings[],
): CategoryApprovalStepData[] {
  if (!categories.length) {
    return [];
  }

  const currentClient = categories.find((category) => category.id === clientId);

  if (!currentClient) {
    return [];
  }

  const approvalStepMap = new Map(
    approvalStepData.map((category) => [category.id, category.approvalSteps]),
  );

  return currentClient.categories
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
