import type { AssignmentCompanyPolicy } from "@/domain/serviceDesk";

/**
 * Resolves the company boundary in which an assignment rule may select users.
 *
 * Duplicate owner/tenant IDs are collapsed and malformed numeric IDs are
 * discarded. This is a shared policy projection; persistence and authorization
 * layers must still validate referenced employees against stored relationships.
 */
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
