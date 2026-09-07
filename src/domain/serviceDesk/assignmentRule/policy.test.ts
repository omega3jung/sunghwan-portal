import { describe, expect, it } from "vitest";

import {
  resolveAssignmentCompanyPolicy,
  resolveAssignmentEligibleCompanyIds,
} from "./policy";

describe("resolveAssignmentCompanyPolicy", () => {
  it.each([
    ["INTERNAL", undefined, "TENANT_ONLY"],
    ["INTERNAL", true, "TENANT_ONLY"],
    ["PORTAL", undefined, "OWNER_ONLY"],
    ["PORTAL", false, "OWNER_ONLY"],
    ["PORTAL", true, "OWNER_AND_TENANT"],
  ] as const)(
    "resolves %s with includeTenantCompany=%s to %s",
    (scope, includeTenantCompany, expected) => {
      expect(
        resolveAssignmentCompanyPolicy({ scope, includeTenantCompany }),
      ).toBe(expected);
    },
  );
});

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

  it("normalizes numeric IDs and deduplicates an owner tenant", () => {
    expect(
      resolveAssignmentEligibleCompanyIds({
        scope: "PORTAL",
        tenantCompanyId: 1,
        ownerCompanyId: "1",
        includeTenantCompany: true,
      }),
    ).toEqual(["1"]);
  });
});
