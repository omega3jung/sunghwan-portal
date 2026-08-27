import { describe, expect, it } from "vitest";

import {
  canAccessOperationalServiceDeskCategory,
  isOperationalServiceDeskTenant,
} from "./operationalAccess";

describe("operational Service Desk access", () => {
  it("rejects cross-tenant client Category Context and Recommendation access", () => {
    expect(
      canAccessOperationalServiceDeskCategory({
        principal: { companyId: 2, userScope: "CLIENT" },
        category: {
          scope: "PORTAL",
          tenant: { companyId: 3, operational: true },
        },
      }),
    ).toBe(false);
  });

  it("allows provider INTERNAL users to access customer PORTAL categories", () => {
    expect(
      canAccessOperationalServiceDeskCategory({
        principal: { companyId: 1, userScope: "INTERNAL" },
        category: {
          scope: "PORTAL",
          tenant: { companyId: 2, operational: true },
        },
      }),
    ).toBe(true);
  });

  it("excludes an active Tenant backed by an inactive Company", () => {
    expect(isOperationalServiceDeskTenant(true, false)).toBe(false);
    expect(isOperationalServiceDeskTenant(true, true)).toBe(true);
  });
});
