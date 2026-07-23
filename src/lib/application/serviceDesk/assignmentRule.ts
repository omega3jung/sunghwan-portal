import type { AssignmentCompanyPolicy } from "@/domain/serviceDesk";

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
