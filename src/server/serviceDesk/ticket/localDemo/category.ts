import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";
import { Priority, RiskLevel } from "@/domain/common";
import { CategoryScope } from "@/domain/serviceDesk";
import { getLocalDemoCategories } from "@/server/serviceDesk/settings/state";
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
      if (String(category.category_id) === normalizedId) {
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

      if (subCategory) {
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

  throw new ServiceDeskApiError("api.tickets.localDemo.categoryNotFound", 404, {
    categoryId,
  });
}
