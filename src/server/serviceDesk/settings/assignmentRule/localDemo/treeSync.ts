import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/feature/serviceDesk/assignmentRule/types";

export const flattenAssignmentRuleTree = (
  payload: SaveServiceDeskAssignmentRuleTreePayload,
) => {
  return payload.categories.flatMap((category) => [
    {
      categoryId: category.id,
      assignee: category.assignee,
    },
    ...category.subCategories.map((subCategory) => ({
      categoryId: subCategory.id,
      assignee: subCategory.assignee,
    })),
  ]);
};
