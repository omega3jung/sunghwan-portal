import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/feature/serviceDesk/approvalStep/types";
import type {
  CreateApprovalStepInput,
  UpdateApprovalStepInput,
} from "@/feature/serviceDesk/approvalStep/write";

import {
  createApprovalStepIdAssigner,
  getApprovalStepLocation,
  getApprovalStepStore,
  getCategoryLocationById,
  getClientCategoriesOrThrow,
  normalizeApprovalStep,
  normalizeCategoryApprovalSettings,
  sortApprovalSteps,
} from "./approvalStepUtils";
import { buildApprovalStepFromInput, createFallbackCategory } from "./treeSync";

export const localCreateApprovalStep = ({
  isInternal,
  input,
}: {
  isInternal: boolean;
  input: CreateApprovalStepInput;
}) => {
  const items = getApprovalStepStore(isInternal);
  const categoryLocation = getCategoryLocationById(items, input.categoryId);

  if (!categoryLocation) {
    throw new ServiceDeskApiError(
      "api.approvalSteps.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const categories = items[categoryLocation.clientId];
  const assignId = createApprovalStepIdAssigner(items);
  const nextApprovalStep = buildApprovalStepFromInput({
    input,
    assignId,
  });

  categories[categoryLocation.categoryIndex].approval_step.push(
    nextApprovalStep,
  );
  categories[categoryLocation.categoryIndex].approval_step = sortApprovalSteps(
    categories[categoryLocation.categoryIndex].approval_step,
  );

  return normalizeApprovalStep(nextApprovalStep);
};

export const localUpdateApprovalStep = ({
  isInternal,
  id,
  input,
}: {
  isInternal: boolean;
  id: string;
  input: UpdateApprovalStepInput;
}) => {
  const items = getApprovalStepStore(isInternal);
  const approvalStepLocation = getApprovalStepLocation(items, id);

  if (!approvalStepLocation) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const targetCategoryLocation = getCategoryLocationById(
    items,
    input.categoryId,
  );

  if (!targetCategoryLocation) {
    throw new ServiceDeskApiError(
      "api.approvalSteps.localDemo.categoryNotFound",
      404,
      { categoryId: input.categoryId },
    );
  }

  const assignId = createApprovalStepIdAssigner(items);
  const previousApprovalStep =
    items[approvalStepLocation.clientId][approvalStepLocation.categoryIndex]
      .approval_step[approvalStepLocation.approvalStepIndex];
  const nextApprovalStep = buildApprovalStepFromInput({
    input: {
      ...input,
      id,
    },
    assignId,
    previousApprovalStep,
  });

  items[approvalStepLocation.clientId][
    approvalStepLocation.categoryIndex
  ].approval_step.splice(approvalStepLocation.approvalStepIndex, 1);
  items[targetCategoryLocation.clientId][
    targetCategoryLocation.categoryIndex
  ].approval_step.push(nextApprovalStep);
  items[targetCategoryLocation.clientId][
    targetCategoryLocation.categoryIndex
  ].approval_step = sortApprovalSteps(
    items[targetCategoryLocation.clientId][targetCategoryLocation.categoryIndex]
      .approval_step,
  );

  return normalizeApprovalStep(nextApprovalStep);
};

export const localSaveApprovalStepTree = ({
  isInternal,
  payload,
}: {
  isInternal: boolean;
  payload: SaveServiceDeskApprovalStepTreePayload;
}) => {
  const items = getApprovalStepStore(isInternal);
  const categories = getClientCategoriesOrThrow(items, payload.clientId);
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
      const submittedIds = new Set(
        nextApprovalSteps.map((approvalStep) =>
          String(approvalStep.approval_step_id),
        ),
      );
      const deactivatedApprovalSteps = previousCategory.approval_step
        .filter(
          (approvalStep) =>
            !submittedIds.has(String(approvalStep.approval_step_id)) &&
            approvalStep.approval_step_active !== false,
        )
        .map((approvalStep) => ({
          ...approvalStep,
          approval_step_active: false,
        }));
      const preservedInactiveApprovalSteps =
        previousCategory.approval_step.filter(
          (approvalStep) =>
            !submittedIds.has(String(approvalStep.approval_step_id)) &&
            approvalStep.approval_step_active === false,
        );

      return {
        ...previousCategory,
        approval_step: [
          ...nextApprovalSteps,
          ...deactivatedApprovalSteps,
          ...preservedInactiveApprovalSteps,
        ],
      };
    },
  );

  const submittedCategoryIds = new Set(
    synchronizedCategories.map((category) => String(category.category_id)),
  );
  const preservedCategories = categories.filter(
    (category) => !submittedCategoryIds.has(String(category.category_id)),
  );

  items[payload.clientId] = [...synchronizedCategories, ...preservedCategories];

  return normalizeCategoryApprovalSettings(items[payload.clientId]);
};

export const localSoftDeleteApprovalStep = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const items = getApprovalStepStore(isInternal);
  const location = getApprovalStepLocation(items, id);

  if (!location) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  const previousApprovalStep =
    items[location.clientId][location.categoryIndex].approval_step[
      location.approvalStepIndex
    ];
  const nextApprovalStep = {
    ...previousApprovalStep,
    approval_step_active: false,
  };

  items[location.clientId][location.categoryIndex].approval_step.splice(
    location.approvalStepIndex,
    1,
    nextApprovalStep,
  );

  return new Response(null, { status: 204 });
};
