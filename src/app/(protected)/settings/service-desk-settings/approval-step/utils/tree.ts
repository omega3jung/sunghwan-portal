import type { TreeNodes } from "@/components/custom/SortableTree";
import type {
  ApprovalStepTreeSyncInput,
  CategoryApprovalStepTreeSyncInput,
  SaveServiceDeskApprovalStepTreePayload,
} from "@/lib/application/contracts/serviceDesk";
import {
  normalizeLocalizedText,
  normalizeOptionalLocalizedText,
} from "@/shared/utils/value";

import type { ApprovalStepData, CategoryApprovalStepData } from "../types";

type ApprovalStepTree = TreeNodes<CategoryApprovalStepData | ApprovalStepData>;

const APPROVAL_STEP_ID_PREFIX = "approval:";
const NEW_APPROVAL_STEP_ID_PREFIX = "newApproval:";

const normalizeApprovalStepId = (value?: string) => {
  if (!value) {
    return undefined;
  }

  if (value.startsWith(APPROVAL_STEP_ID_PREFIX)) {
    return value.slice(APPROVAL_STEP_ID_PREFIX.length);
  }

  if (value.startsWith(NEW_APPROVAL_STEP_ID_PREFIX)) {
    return undefined;
  }

  return value;
};

const normalizeApprovalAssignee = (
  value: ApprovalStepTreeSyncInput["stepAssignee"],
) => {
  switch (value.type) {
    case "EMPLOYEE":
      return {
        ...value,
        employeeUsernames: value.employeeUsernames.slice().sort(),
      };
    default:
      return value;
  }
};

export const buildApprovalStepTreeSavePayload = ({
  tenantId,
  tree,
}: {
  tenantId: string;
  tree: ApprovalStepTree;
}): SaveServiceDeskApprovalStepTreePayload => {
  return {
    tenantId,
    categories: tree.map((categoryNode) => {
      const categoryData = categoryNode.data as CategoryApprovalStepData;

      return {
        id: categoryData.categoryId,
        approvalSteps: categoryNode.children.map(
          (approvalNode, approvalIndex) => {
            const approvalData = approvalNode.data as ApprovalStepData;

            return {
              id: normalizeApprovalStepId(approvalData.id),
              name: normalizeLocalizedText(approvalData.name),
              description: normalizeOptionalLocalizedText(
                approvalData.description,
              ),
              index: approvalIndex + 1,
              stepAssignee: normalizeApprovalAssignee(
                approvalData.stepAssignee,
              ),
              skipAccessLevel: approvalData.skipAccessLevel,
            };
          },
        ),
      };
    }),
  };
};

const normalizeApprovalStepsForComparison = (
  approvalSteps: ApprovalStepTreeSyncInput[],
) => {
  return approvalSteps.map((approvalStep, approvalIndex) => ({
    id: normalizeApprovalStepId(approvalStep.id),
    name: normalizeLocalizedText(approvalStep.name),
    description: normalizeOptionalLocalizedText(approvalStep.description),
    index: approvalIndex + 1,
    stepAssignee: normalizeApprovalAssignee(approvalStep.stepAssignee),
    skipAccessLevel: approvalStep.skipAccessLevel,
  }));
};

const normalizeCategoriesForComparison = (
  categories: CategoryApprovalStepTreeSyncInput[],
) => {
  return categories.map((category) => ({
    id: category.id,
    approvalSteps: normalizeApprovalStepsForComparison(category.approvalSteps),
  }));
};

export const createApprovalStepSettingsSignatureFromTree = (
  tree: ApprovalStepTree,
) => {
  const payload = buildApprovalStepTreeSavePayload({
    tenantId: "comparison",
    tree,
  });

  return JSON.stringify(normalizeCategoriesForComparison(payload.categories));
};

export const isApprovalStepAssigneeValid = (approvalStep: ApprovalStepData) => {
  switch (approvalStep.stepAssignee.type) {
    case "MANAGER":
      return (
        approvalStep.stepAssignee.managerDistance === 1 ||
        approvalStep.stepAssignee.managerDistance === 2
      );
    case "DEPARTMENT":
      return approvalStep.stepAssignee.departmentId.trim().length > 0;
    case "JOB_FIELD":
      return approvalStep.stepAssignee.jobFieldId.trim().length > 0;
    case "EMPLOYEE":
      return (
        approvalStep.stepAssignee.employeeUsernames.length > 0 &&
        approvalStep.stepAssignee.employeeUsernames.every(
          (employeeUsername) => employeeUsername.trim().length > 0,
        )
      );
  }
};

export const isApprovalStepTreeValid = (tree: ApprovalStepTree) => {
  return getApprovalStepTreeErrors(tree).size === 0;
};

export const getApprovalStepTreeErrors = (tree: ApprovalStepTree) => {
  const errors = new Map<string, "invalidAssignee">();

  tree.forEach((categoryNode) => {
    categoryNode.children.forEach((approvalNode) => {
      const approvalData = approvalNode.data as ApprovalStepData;

      if (!isApprovalStepAssigneeValid(approvalData)) {
        errors.set(approvalNode.id.toString(), "invalidAssignee");
      }
    });
  });

  return errors;
};
