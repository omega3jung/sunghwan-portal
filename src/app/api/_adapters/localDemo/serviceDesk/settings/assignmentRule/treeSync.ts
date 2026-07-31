import type { SaveServiceDeskAssignmentRuleTreePayload } from "@/lib/application/contracts/serviceDesk";

/** Flattens category and subcategory selections into repository-like rule rows. */
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
