import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import type {
  ApprovalStep,
  CategoryApprovalSettings,
} from "@/domain/serviceDesk";
import type {
  ApprovalStepTreeSyncInput,
  CategoryApprovalStepTreeSyncInput,
  SaveServiceDeskApprovalStepTreePayload,
} from "@/feature/serviceDesk/approvalStep/types";
import type { LocalizedText } from "@/shared/types";

import type { ApprovalStepData, CategoryApprovalStepData } from "../types";

type ApprovalStepTree = TreeNodes<CategoryApprovalStepData | ApprovalStepData>;

const APPROVAL_STEP_ID_PREFIX = "approval:";
const NEW_APPROVAL_STEP_ID_PREFIX = "newApproval:";

const normalizeLocalizedText = (value?: LocalizedText) => {
  return Object.fromEntries(
    Object.entries(value ?? {})
      .filter(([, text]) => typeof text === "string")
      .sort(([left], [right]) => left.localeCompare(right)),
  ) as LocalizedText;
};

const normalizeOptionalLocalizedText = (value?: LocalizedText) => {
  const normalizedValue = normalizeLocalizedText(value);

  return Object.keys(normalizedValue).length ? normalizedValue : undefined;
};

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
  approvalSteps: ApprovalStepTreeSyncInput[] | ApprovalStep[],
) => {
  return approvalSteps.map((approvalStep, approvalIndex) => ({
    ...approvalStep,
    id: normalizeApprovalStepId(approvalStep.id),
    name: normalizeLocalizedText(approvalStep.name),
    description: normalizeOptionalLocalizedText(approvalStep.description),
    index: approvalIndex + 1,
    stepAssignee: normalizeApprovalAssignee(approvalStep.stepAssignee),
  }));
};

const normalizeCategoriesForComparison = (
  categories: CategoryApprovalStepTreeSyncInput[] | CategoryApprovalSettings[],
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
        approvalStep.stepAssignee.level === 1 ||
        approvalStep.stepAssignee.level === 2
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
  return tree.every((categoryNode) =>
    categoryNode.children.every((approvalNode) => {
      const approvalData = approvalNode.data as ApprovalStepData;

      return isApprovalStepAssigneeValid(approvalData);
    }),
  );
};

export const createApprovalStepSettingsSignatureFromApprovalSettings = (
  categories: CategoryApprovalSettings[],
) => {
  const normalizedCategories = categories
    .slice()
    .sort((left, right) => left.index - right.index)
    .map((category) => ({
      ...category,
      approvalSteps: category.approvalSteps
        .slice()
        .sort((left, right) => left.index - right.index),
    }));

  return JSON.stringify(normalizeCategoriesForComparison(normalizedCategories));
};
