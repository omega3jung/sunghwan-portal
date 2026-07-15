export const OWNER_COMPANY_ID = "1";

export function isOwnerCompany(companyId: string | number | null | undefined) {
  return String(companyId ?? "") === OWNER_COMPANY_ID;
}
