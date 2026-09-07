import type {
  MainCategory,
  TenantCategoryTree,
} from "@/domain/serviceDesk";

/** Finds the categories owned by the selected tenant. */
export function findTenantCategories(
  tenantCategoryTrees: readonly TenantCategoryTree[] | undefined,
  tenantId: string | null,
): readonly MainCategory[] | undefined {
  if (!tenantCategoryTrees || !tenantId) {
    return undefined;
  }

  return tenantCategoryTrees.find((tenant) => tenant.id === tenantId)
    ?.categories;
}
