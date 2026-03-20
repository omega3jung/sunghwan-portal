import { TreeNodes } from "@/components/custom/dnd/tree/types";
import { AssignmentRule, ClientCategoryTree } from "@/domain/serviceDesk";

import { AssignmentRuleData, MainAssignmentRuleData } from "./types";

export const mapAssignmentRuleData = (
  categories: ClientCategoryTree[],
  clientId: string,
  assignmentRules: AssignmentRule[],
): MainAssignmentRuleData[] => {
  if (!categories?.length) {
    return [];
  }

  const current = categories.find((category) => category.id === clientId);

  if (!current) {
    return [];
  }

  return current.category.map((cat) => {
    const catAssRule = assignmentRules.find(
      (assignmentRule) => assignmentRule.categoryId === cat.id,
    )?.assignee;
    return {
      ...cat,
      jobFieldIds: catAssRule?.jobFieldIds || [],
      employeeIds: catAssRule?.employeeIds || [],
      subCategories: cat.subCategories?.map((sub) => {
        const subCatAssRule = assignmentRules.find(
          (assignmentRule) => assignmentRule.categoryId === sub.id,
        )?.assignee;
        return {
          ...sub,
          jobFieldIds: subCatAssRule?.jobFieldIds || [],
          employeeIds: subCatAssRule?.employeeIds || [],
        };
      }),
    };
  });
};

export const assignmentRuleToTree = (
  categories: MainAssignmentRuleData[],
): TreeNodes<AssignmentRuleData | MainAssignmentRuleData> => {
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
