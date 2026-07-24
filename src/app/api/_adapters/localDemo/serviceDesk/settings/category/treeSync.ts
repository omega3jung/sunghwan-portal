import type { DbCategory } from "@/lib/application/contracts/serviceDesk";
import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";

const synchronizeSubCategories = ({
  nextSubCategories,
  previousSubCategories,
  assignId,
  parentActive,
}: {
  nextSubCategories: SaveServiceDeskCategoryTreePayload["categories"][number]["subCategories"];
  previousSubCategories: DbCategory["sub_category"];
  assignId: (value?: string) => number;
  parentActive: boolean;
}) => {
  const synchronizedSubCategories = nextSubCategories.map(
    (subCategory, subCategoryIndex) => {
      const resolvedId = assignId(subCategory.id);

      return {
        category_id: resolvedId,
        category_name: subCategory.name,
        category_description: subCategory.description ?? null,
        category_request_template: subCategory.requestTemplate ?? null,
        category_index: subCategoryIndex + 1,
        category_active: parentActive ? subCategory.active : false,
        default_priority: subCategory.defaultPriority ?? null,
        default_risk_level: subCategory.defaultRiskLevel ?? null,
        default_sla_days: subCategory.defaultSlaDays ?? null,
      };
    },
  );

  const submittedIds = new Set(
    synchronizedSubCategories.map((subCategory) =>
      String(subCategory.category_id),
    ),
  );
  const preservedSubCategories = previousSubCategories
    .filter((subCategory) => !submittedIds.has(String(subCategory.category_id)))
    .sort((left, right) => left.category_index - right.category_index)
    .map((subCategory, subCategoryIndex) => ({
      ...subCategory,
      category_index: synchronizedSubCategories.length + subCategoryIndex + 1,
      category_active: parentActive ? subCategory.category_active : false,
    }));

  return [...synchronizedSubCategories, ...preservedSubCategories];
};

export const buildSynchronizedCategory = ({
  category,
  previousCategory,
  assignId,
}: {
  category: SaveServiceDeskCategoryTreePayload["categories"][number];
  previousCategory?: DbCategory;
  assignId: (value?: string) => number;
}) => {
  const resolvedId = previousCategory?.category_id ?? assignId(category.id);
  const active = category.active;

  return {
    category_id: resolvedId,
    category_name: category.name,
    category_description: category.description ?? null,
    category_request_template: category.requestTemplate ?? null,
    category_scope: category.scope,
    category_index: category.index,
    category_active: active,
    default_priority: category.defaultPriority,
    default_risk_level: category.defaultRiskLevel,
    default_sla_days: category.defaultSlaDays,
    sub_category: synchronizeSubCategories({
      nextSubCategories: category.subCategories,
      previousSubCategories: previousCategory?.sub_category ?? [],
      assignId,
      parentActive: active,
    }),
  } satisfies DbCategory;
};
