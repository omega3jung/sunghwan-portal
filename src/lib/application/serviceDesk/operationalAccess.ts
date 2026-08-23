import type { UserScope } from "@/domain/auth";
import type { CategoryScope } from "@/domain/serviceDesk";

export function isOperationalServiceDeskTenant(
  tenantActive: boolean,
  companyActive: boolean,
) {
  return tenantActive && companyActive;
}

/** Object-level visibility used by operational Category and Ticket workflows. */
export function canAccessOperationalServiceDeskCategory({
  principal,
  category,
}: {
  principal: { companyId: string | number; userScope: UserScope };
  category: {
    scope: CategoryScope;
    tenant: { companyId: string | number; operational: boolean };
  };
}) {
  if (!category.tenant.operational) return false;

  if (String(principal.companyId) === String(category.tenant.companyId)) {
    return true;
  }

  return principal.userScope === "INTERNAL" && category.scope === "PORTAL";
}
