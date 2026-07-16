import { getLocalDemoCategories } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { Priority, RiskLevel } from "@/domain/common";
import { CategoryScope } from "@/domain/serviceDesk";
import { ApiError } from "@/lib/application/api";
import { LocalizedText } from "@/shared/types";

export type ResolvedCategorySnapshot = {
  id: string;
  parentId: string;
  name: LocalizedText;
  scope: CategoryScope;
  defaultPriority: Priority | null;
  defaultRiskLevel: RiskLevel | null;
};

export function resolveCategorySnapshot({
  isInternal,
  categoryId,
}: {
  isInternal: boolean;
  categoryId: string;
}): ResolvedCategorySnapshot {
  const normalizedId = categoryId.trim();

  for (const client of getLocalDemoCategories(isInternal)) {
    for (const category of client.category) {
      if (String(category.category_id) === normalizedId && category.category_active) {
        return {
          id: String(category.category_id),
          parentId: String(category.category_id),
          name: category.category_name,
          scope: category.category_scope,
          defaultPriority: category.default_priority ?? null,
          defaultRiskLevel: category.default_risk_level ?? null,
        };
      }

      const subCategory = category.sub_category.find(
        (item) => String(item.category_id) === normalizedId,
      );

      if (subCategory && category.category_active && subCategory.category_active) {
        return {
          id: String(subCategory.category_id),
          parentId: String(category.category_id),
          name: subCategory.category_name,
          scope: category.category_scope,
          defaultPriority:
            subCategory.default_priority ?? category.default_priority ?? null,
          defaultRiskLevel:
            subCategory.default_risk_level ??
            category.default_risk_level ??
            null,
        };
      }
    }
  }

  throw new ApiError("serviceDesk.tickets.localDemo.categoryNotFound", 404, {
    categoryId,
  });
}
