import { describe, expect, it } from "vitest";

import { assertPortalOwnerTenantRemainsActive } from "./tenantService";

describe("portal-owner Tenant protection", () => {
  it("rejects PUT/DELETE deactivation for the owner Tenant", () => {
    expect(() => assertPortalOwnerTenantRemainsActive(1, false)).toThrow();
    expect(() => assertPortalOwnerTenantRemainsActive(1, true)).not.toThrow();
    expect(() => assertPortalOwnerTenantRemainsActive(2, false)).not.toThrow();
  });
});
