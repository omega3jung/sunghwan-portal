import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { AssignmentRule, TenantCategoryTree } from "@/domain/serviceDesk";

import { AssignmentRuleData, SubAssignmentRuleData } from "../types";

export const mapAssignmentRuleData = (
  categories: TenantCategoryTree[],
  tenantId: string,
  assignmentRules: AssignmentRule[],
): AssignmentRuleData[] => {
  if (!categories?.length) {
    return [];
  }

  const current = categories.find((category) => category.id === tenantId);

  if (!current) {
    return [];
  }

  return current.categories.map((cat) => {
    const catAssRule = assignmentRules.find(
      (assignmentRule) => assignmentRule.categoryId === cat.id,
    )?.assignee;
    return {
      ...cat,
      jobFieldIds: catAssRule?.jobFieldIds || [],
      assigneeUsernames: catAssRule?.assigneeUsernames || [],
      subCategories: cat.subCategories?.map((sub) => {
        const subCatAssRule = assignmentRules.find(
          (assignmentRule) => assignmentRule.categoryId === sub.id,
        )?.assignee;
        return {
          ...sub,
          jobFieldIds: subCatAssRule?.jobFieldIds || [],
          assigneeUsernames: subCatAssRule?.assigneeUsernames || [],
        };
      }),
    };
  });
};

export const assignmentRuleToTree = (
  categories: AssignmentRuleData[],
): TreeNodes<AssignmentRuleData | SubAssignmentRuleData> => {
  return categories.map((main) => ({
    id: main.id,
    data: main,
    collapsed: false,
    children:
      main.subCategories?.map((sub) => ({
        id: sub.id,
        data: sub,
        children: [],
      })) ?? [],
  }));
};
