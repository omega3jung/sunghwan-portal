import type { CategoryScope } from "@/domain/serviceDesk/category";

export type AssignmentCompanyPolicy =
  | "TENANT_ONLY"
  | "OWNER_ONLY"
  | "OWNER_AND_TENANT";

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

export function getAllowedAssignmentCompanyIds({
  tenantCompanyId,
  ownerCompanyId,
  companyPolicy,
}: {
  tenantCompanyId: string | number;
  ownerCompanyId: string | number;
  companyPolicy: AssignmentCompanyPolicy;
}): number[] {
  const tenantId = Number(tenantCompanyId);
  const ownerId = Number(ownerCompanyId);
  const companyIds =
    companyPolicy === "TENANT_ONLY"
      ? [tenantId]
      : companyPolicy === "OWNER_ONLY"
        ? [ownerId]
        : [ownerId, tenantId];

  return Array.from(new Set(companyIds)).filter(Number.isFinite);
}
