import { describe, expect, it } from "vitest";

import { getAllowedAssignmentCompanyIds } from "./assignmentRule";

describe("assignment company boundary", () => {
  it.each([
    ["TENANT_ONLY", [2]],
    ["OWNER_ONLY", [1]],
    ["OWNER_AND_TENANT", [1, 2]],
  ] as const)("resolves %s to the permitted company IDs", (companyPolicy, expected) => {
    expect(
      getAllowedAssignmentCompanyIds({
        tenantCompanyId: "2",
        ownerCompanyId: "1",
        companyPolicy,
      }),
    ).toEqual(expected);
  });

  it("deduplicates the owner tenant and discards malformed identifiers", () => {
    expect(
      getAllowedAssignmentCompanyIds({
        tenantCompanyId: "1",
        ownerCompanyId: 1,
        companyPolicy: "OWNER_AND_TENANT",
      }),
    ).toEqual([1]);
    expect(
      getAllowedAssignmentCompanyIds({
        tenantCompanyId: "invalid",
        ownerCompanyId: 1,
        companyPolicy: "OWNER_AND_TENANT",
      }),
    ).toEqual([1]);
  });
});
