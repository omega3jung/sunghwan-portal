import type { TreeNodes } from "@/components/custom/dnd/tree/types";
import type { AssignmentRule, ClientCategoryTree } from "@/domain/serviceDesk";
import type {
  AssignmentRuleTreeSyncCategoryInput,
  SaveServiceDeskAssignmentRuleTreePayload,
} from "@/feature/serviceDesk/assignmentRule/types";

import type { AssignmentRuleData, SubAssignmentRuleData } from "../types";
import { mapAssignmentRuleData } from "./mapper";

type AssignmentRuleTree = TreeNodes<AssignmentRuleData | SubAssignmentRuleData>;

const normalizeIdList = (value: string[]) => {
  return Array.from(new Set(value)).sort((left, right) =>
    left.localeCompare(right),
  );
};

const normalizeAssignee = (assignmentRule: {
  assignee: {
    jobFieldIds: string[];
    assigneeUsernames: string[];
  };
}) => {
  return {
    jobFieldIds: normalizeIdList(assignmentRule.assignee.jobFieldIds),
    assigneeUsernames: normalizeIdList(assignmentRule.assignee.assigneeUsernames),
  };
};

export const hasAssignmentRuleAssignee = (assignmentRule: {
  assignee: {
    jobFieldIds: string[];
    assigneeUsernames: string[];
  };
}) => {
  return (
    assignmentRule.assignee.jobFieldIds.length > 0 ||
    assignmentRule.assignee.assigneeUsernames.length > 0
  );
};

export const buildAssignmentRuleTreeSavePayload = ({
  clientId,
  tree,
}: {
  clientId: string;
  tree: AssignmentRuleTree;
}): SaveServiceDeskAssignmentRuleTreePayload => {
  return {
    clientId,
    categories: tree.map((categoryNode) => {
      const categoryData = categoryNode.data as AssignmentRuleData;

      return {
        id: categoryData.id,
        assignee: normalizeAssignee({ assignee: categoryData }),
        subCategories: categoryNode.children.map((subCategoryNode) => {
          const subCategoryData = subCategoryNode.data as SubAssignmentRuleData;

          return {
            id: subCategoryData.id,
            assignee: normalizeAssignee({ assignee: subCategoryData }),
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
    assignee: normalizeAssignee(category),
    subCategories: category.subCategories.map((subCategory) => ({
      id: subCategory.id,
      assignee: normalizeAssignee(subCategory),
    })),
  }));
};

export const createAssignmentRuleSettingsSignatureFromTree = (
  tree: AssignmentRuleTree,
) => {
  const payload = buildAssignmentRuleTreeSavePayload({
    clientId: "comparison",
    tree,
  });

  return JSON.stringify(normalizeCategoriesForComparison(payload.categories));
};

export const isAssignmentRuleTreeValid = (tree: AssignmentRuleTree) => {
  return tree.every((categoryNode) => {
    const categoryData = categoryNode.data as AssignmentRuleData;

    if (!hasAssignmentRuleAssignee({ assignee: categoryData })) {
      return false;
    }

    return categoryNode.children.every((subCategoryNode) => {
      const subCategoryData = subCategoryNode.data as SubAssignmentRuleData;

      return hasAssignmentRuleAssignee({ assignee: subCategoryData });
    });
  });
};

export const isAssignmentRuleMainCategoryTreeValid = (
  tree: AssignmentRuleTree,
) => {
  return tree.every((categoryNode) => {
    const categoryData = categoryNode.data as AssignmentRuleData;

    return hasAssignmentRuleAssignee({ assignee: categoryData });
  });
};

export const createAssignmentRuleSettingsSignatureFromAssignmentRules = ({
  categories,
  selectedClient,
  assignmentRules,
}: {
  categories: ClientCategoryTree[] | undefined;
  selectedClient: string | null;
  assignmentRules: AssignmentRule[] | undefined;
}) => {
  if (!categories || !selectedClient) {
    return JSON.stringify([]);
  }

  const mappedCategories = mapAssignmentRuleData(
    categories,
    selectedClient,
    assignmentRules ?? [],
  );
  const normalizedCategories = mappedCategories.map((category) => ({
    id: category.id,
    assignee: {
      jobFieldIds: category.jobFieldIds,
      assigneeUsernames: category.assigneeUsernames,
    },
    subCategories: category.subCategories.map((subCategory) => ({
      id: subCategory.id,
      assignee: {
        jobFieldIds: subCategory.jobFieldIds,
        assigneeUsernames: subCategory.assigneeUsernames,
      },
    })),
  }));

  return JSON.stringify(normalizeCategoriesForComparison(normalizedCategories));
};
