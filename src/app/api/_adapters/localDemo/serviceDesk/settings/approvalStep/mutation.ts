import { replaceLocalDemoApprovalStepCategories } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/lib/application/contracts/serviceDesk";

import {
  createApprovalStepIdAssigner,
  getApprovalStepStore,
  getTenantCategoriesOrThrow,
  normalizeCategoryApprovalSettings,
} from "./approvalStepUtils";
import { buildApprovalStepFromInput, createFallbackCategory } from "./treeSync";

export const localSaveApprovalStepTree = ({
  isInternal,
  payload,
}: {
  isInternal: boolean;
  payload: SaveServiceDeskApprovalStepTreePayload;
}) => {
  const items = getApprovalStepStore(isInternal);
  const categories = getTenantCategoriesOrThrow(items, payload.tenantId);
  const previousCategoryMap = new Map(
    categories.map((category) => [String(category.category_id), category]),
  );
  const assignId = createApprovalStepIdAssigner(items);

  const synchronizedCategories = payload.categories.map(
    (category, categoryIndex) => {
      const previousCategory =
        previousCategoryMap.get(category.id) ??
        createFallbackCategory({
          categoryId: category.id,
          index: categoryIndex + 1,
        });

      const previousApprovalStepMap = new Map(
        previousCategory.approval_step.map((approvalStep) => [
          String(approvalStep.approval_step_id),
          approvalStep,
        ]),
      );
      const nextApprovalSteps = category.approvalSteps.map(
        (approvalStep, index) =>
          buildApprovalStepFromInput({
            input: {
              ...approvalStep,
              index: index + 1,
              categoryId: category.id,
            },
            assignId,
            previousApprovalStep: approvalStep.id
              ? previousApprovalStepMap.get(approvalStep.id)
              : undefined,
          }),
      );

      return {
        ...previousCategory,
        approval_step: nextApprovalSteps,
      };
    },
  );

  const submittedCategoryIds = new Set(
    synchronizedCategories.map((category) => String(category.category_id)),
  );
  const preservedCategories = categories.filter(
    (category) => !submittedCategoryIds.has(String(category.category_id)),
  );

  items[payload.tenantId] = [...synchronizedCategories, ...preservedCategories];
  replaceLocalDemoApprovalStepCategories({
    tenantId: payload.tenantId,
    categoryIds: categories.map((category) => category.category_id),
    categories: items[payload.tenantId],
  });

  return normalizeCategoryApprovalSettings(items[payload.tenantId]);
};
