import { describe, expect, it } from "vitest";

import { resolveAssignmentEligibleCompanyIds } from "./policy";

describe("resolveAssignmentEligibleCompanyIds", () => {
  it("uses the category tenant company for INTERNAL rules", () => {
    expect(
      resolveAssignmentEligibleCompanyIds({
        scope: "INTERNAL",
        tenantCompanyId: "customer",
        ownerCompanyId: "provider",
      }),
    ).toEqual(["customer"]);
  });

  it("uses provider-only by default and both companies for joint PORTAL rules", () => {
    const base = {
      scope: "PORTAL" as const,
      tenantCompanyId: "customer",
      ownerCompanyId: "provider",
    };

    expect(resolveAssignmentEligibleCompanyIds(base)).toEqual(["provider"]);
    expect(
      resolveAssignmentEligibleCompanyIds({
        ...base,
        includeTenantCompany: true,
      }),
    ).toEqual(["provider", "customer"]);
  });
});
