import type { TreeNodes } from "@/components/custom/SortableTree";
import {
  type AssignmentRule,
  hasAssignmentRuleSelection,
  type MainCategory,
} from "@/domain/serviceDesk";

import type { AssignmentRuleNodeData } from "../types";

const createEmptyAssignee = () => ({
  jobFieldIds: [],
  assigneeUsernames: [],
  includeTenantCompany: false,
});

export function createAssignmentRuleTree(
  categories: readonly MainCategory[],
  assignmentRules: readonly AssignmentRule[],
): TreeNodes<AssignmentRuleNodeData> {
  const assigneeByCategoryId = new Map(
    assignmentRules.map((rule) => [rule.categoryId, rule.assignee]),
  );

  return categories.map((category) => {
    const { subCategories, ...categoryData } = category;

    return {
      id: category.id,
      data: {
        ...categoryData,
        ...(assigneeByCategoryId.get(category.id) ?? createEmptyAssignee()),
        nodeType: "mainCategory" as const,
      },
      collapsed: false,
      children: subCategories.map((subCategory) => {
        const assignmentRule = assigneeByCategoryId.get(subCategory.id);

        return {
          id: subCategory.id,
          data: {
            ...subCategory,
            nodeType: "subCategory" as const,
            assignmentRule:
              assignmentRule && hasAssignmentRuleSelection(assignmentRule)
                ? assignmentRule
                : null,
          },
          children: [],
        };
      }),
    };
  });
}
