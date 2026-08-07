import type { TreeNodes } from "@/components/custom/SortableTree";
import {
  type AssigneeGroup,
  hasAssignmentRuleSelection,
} from "@/domain/serviceDesk";
import type {
  AssignmentRuleTreeSyncCategoryInput,
  SaveServiceDeskAssignmentRuleTreePayload,
} from "@/lib/application/contracts/serviceDesk";

import {
  type AssignmentRuleData,
  type AssignmentRuleNodeData,
  isSubAssignmentRuleData,
} from "../types";

type AssignmentRuleTree = TreeNodes<AssignmentRuleNodeData>;

const createEmptyAssignee = (): AssigneeGroup => ({
  jobFieldIds: [],
  assigneeUsernames: [],
  includeTenantCompany: false,
});

const normalizeIdList = (value: string[]) => {
  return Array.from(new Set(value)).sort((left, right) =>
    left.localeCompare(right),
  );
};

const normalizeAssignee = (
  assignee: AssigneeGroup,
  allowTenantCompany = true,
) => {
  return {
    jobFieldIds: normalizeIdList(assignee.jobFieldIds),
    assigneeUsernames: normalizeIdList(assignee.assigneeUsernames),
    includeTenantCompany:
      allowTenantCompany && assignee.includeTenantCompany === true,
  };
};

const getMainCategoryAssignee = (data: AssignmentRuleData): AssigneeGroup => ({
  jobFieldIds: data.jobFieldIds,
  assigneeUsernames: data.assigneeUsernames,
  includeTenantCompany: data.includeTenantCompany,
});

export const getEffectiveAssignmentRuleAssignee = (
  data: AssignmentRuleNodeData,
  inheritedAssignee: AssigneeGroup | null = null,
): AssigneeGroup => {
  if (isSubAssignmentRuleData(data)) {
    return data.assignmentRule ?? inheritedAssignee ?? createEmptyAssignee();
  }

  return getMainCategoryAssignee(data);
};

export const updateAssignmentRuleNodeAssignee = (
  data: AssignmentRuleNodeData,
  assignee: AssigneeGroup,
): AssignmentRuleNodeData => {
  if (isSubAssignmentRuleData(data)) {
    return {
      ...data,
      assignmentRule: hasAssignmentRuleSelection(assignee) ? assignee : null,
    };
  }

  return {
    ...data,
    ...assignee,
  };
};

export const buildAssignmentRuleTreeSavePayload = ({
  tenantId,
  tree,
}: {
  tenantId: string;
  tree: AssignmentRuleTree;
}): SaveServiceDeskAssignmentRuleTreePayload => {
  return {
    tenantId,
    categories: tree.map((categoryNode) => {
      const categoryData = categoryNode.data as AssignmentRuleData;

      return {
        id: categoryData.id,
        assignee: normalizeAssignee(
          getMainCategoryAssignee(categoryData),
          categoryData.scope === "PORTAL",
        ),
        subCategories: categoryNode.children.map((subCategoryNode) => {
          const subCategoryData = subCategoryNode.data;
          const assignmentRule = isSubAssignmentRuleData(subCategoryData)
            ? subCategoryData.assignmentRule
            : null;

          return {
            id: subCategoryData.id,
            assignee: normalizeAssignee(
              assignmentRule ?? createEmptyAssignee(),
              categoryData.scope === "PORTAL",
            ),
          };
        }),
      };
    }),
  };
};

const normalizeCategoriesForComparison = (
  categories: AssignmentRuleTreeSyncCategoryInput[],
) => {
  return categories.map((category) => ({
    id: category.id,
    assignee: normalizeAssignee(category.assignee),
    subCategories: category.subCategories.map((subCategory) => ({
      id: subCategory.id,
      assignee: normalizeAssignee(subCategory.assignee),
    })),
  }));
};

export const createAssignmentRuleSettingsSignatureFromTree = (
  tree: AssignmentRuleTree,
) => {
  const payload = buildAssignmentRuleTreeSavePayload({
    tenantId: "comparison",
    tree,
  });

  return JSON.stringify(normalizeCategoriesForComparison(payload.categories));
};

export const isAssignmentRuleTreeValid = (tree: AssignmentRuleTree) => {
  return getAssignmentRuleTreeErrors(tree).size === 0;
};

export const getAssignmentRuleTreeErrors = (tree: AssignmentRuleTree) => {
  const errors = new Map<string, "missingAssignee">();

  tree.forEach((categoryNode) => {
    const categoryData = categoryNode.data as AssignmentRuleData;

    if (!hasAssignmentRuleSelection(getMainCategoryAssignee(categoryData))) {
      errors.set(categoryNode.id.toString(), "missingAssignee");
    }

    categoryNode.children.forEach((subCategoryNode) => {
      const subCategoryData = subCategoryNode.data;

      if (
        isSubAssignmentRuleData(subCategoryData) &&
        subCategoryData.assignmentRule !== null &&
        !hasAssignmentRuleSelection(subCategoryData.assignmentRule)
      ) {
        errors.set(subCategoryNode.id.toString(), "missingAssignee");
      }
    });
  });

  return errors;
};
