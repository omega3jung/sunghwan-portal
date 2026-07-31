/** Canonical provider company identifier used by tenant-boundary rules. */
export const OWNER_COMPANY_ID = "1";

/** Returns whether owner company under the organization domain rules. */
export function isOwnerCompany(companyId: string | number | null | undefined) {
  return String(companyId ?? "") === OWNER_COMPANY_ID;
}
