import { describe, expect, it } from "vitest";

import { resolveAuthoritativeTicketCategory } from "./ticketCategoryAccess";

const category = {
  cat_id: 10,
  cat_tenant_id: 20,
  cat_scope: "INTERNAL" as const,
  tenant_company_id: 2,
  cat_parent_id: null,
  cat_default_priority: "medium" as const,
  cat_default_risk_level: "medium" as const,
  cat_default_sla_days: 3,
};

describe("authoritative Ticket Category context", () => {
  it("rejects a foreign Category for create/update", () => {
    expect(() =>
      resolveAuthoritativeTicketCategory(category, {
        companyId: 3,
        userScope: "CLIENT",
      }),
    ).toThrow();
  });

  it("returns the persisted Category Tenant instead of a payload Tenant", () => {
    expect(
      resolveAuthoritativeTicketCategory(category, {
        companyId: 2,
        userScope: "CLIENT",
      }).cat_tenant_id,
    ).toBe(20);
  });
});
