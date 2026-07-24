import type { CategoryScope } from "../category";

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
