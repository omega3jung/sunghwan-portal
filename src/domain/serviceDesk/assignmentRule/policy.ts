import type { CategoryScope } from "../category";

/** Company boundary applied when resolving assignment candidates. */
export type AssignmentCompanyPolicy =
  "TENANT_ONLY" | "OWNER_ONLY" | "OWNER_AND_TENANT";

export function resolveAssignmentCompanyPolicy({
  scope,
  includeTenantCompany,
}: {
  scope: CategoryScope;
  includeTenantCompany?: boolean;
}): AssignmentCompanyPolicy {
  if (scope === "INTERNAL") {
    return "TENANT_ONLY";
  }

  return includeTenantCompany ? "OWNER_AND_TENANT" : "OWNER_ONLY";
}

/** Resolves the concrete companies eligible for assignment references and routing. */
export function resolveAssignmentEligibleCompanyIds({
  scope,
  tenantCompanyId,
  ownerCompanyId,
  includeTenantCompany,
}: {
  scope: CategoryScope;
  tenantCompanyId: string | number;
  ownerCompanyId: string | number;
  includeTenantCompany?: boolean;
}): string[] {
  const policy = resolveAssignmentCompanyPolicy({
    scope,
    includeTenantCompany,
  });
  const tenantId = String(tenantCompanyId);
  const ownerId = String(ownerCompanyId);

  if (policy === "TENANT_ONLY") return [tenantId];
  if (policy === "OWNER_ONLY") return [ownerId];

  return ownerId === tenantId ? [ownerId] : [ownerId, tenantId];
}
