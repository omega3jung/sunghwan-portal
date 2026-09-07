import { describe, expect, it } from "vitest";

import type {
  ServiceDeskSettingsPrincipal,
  ServiceDeskSettingsResourceContext,
} from "./settingsAccess";
import {
  canManageServiceDeskSettings,
  canReadServiceDeskSettings,
  resolveSettingsAccess,
} from "./settingsAccess";

const ownerAdmin: ServiceDeskSettingsPrincipal = {
  permission: 9,
  userScope: "INTERNAL",
  companyId: 1,
};

const tenantAdmin: ServiceDeskSettingsPrincipal = {
  permission: 9,
  userScope: "CLIENT",
  companyId: 2,
};

const customerPortalContext = (
  resource: ServiceDeskSettingsResourceContext["resource"],
): ServiceDeskSettingsResourceContext => ({
  resource,
  tenantCompanyId: 2,
  isOwnerTenant: false,
  scope: "PORTAL",
});

describe("Service Desk settings access policy", () => {
  it.each([
    [ownerAdmin, { resource: "TENANT" }, "manage"],
    [tenantAdmin, { resource: "TENANT" }, "none"],
    [
      ownerAdmin,
      {
        resource: "CATEGORY",
        tenantCompanyId: 1,
        isOwnerTenant: true,
        scope: "INTERNAL",
      },
      "manage",
    ],
    [
      tenantAdmin,
      {
        resource: "CATEGORY",
        tenantCompanyId: 2,
        isOwnerTenant: false,
        scope: "INTERNAL",
      },
      "manage",
    ],
    [
      ownerAdmin,
      {
        resource: "CATEGORY",
        tenantCompanyId: 2,
        isOwnerTenant: false,
        scope: "INTERNAL",
      },
      "none",
    ],
    [ownerAdmin, customerPortalContext("CATEGORY"), "manage"],
    [tenantAdmin, customerPortalContext("CATEGORY"), "read"],
    [ownerAdmin, customerPortalContext("APPROVAL_STEP"), "read"],
    [tenantAdmin, customerPortalContext("APPROVAL_STEP"), "manage"],
    [ownerAdmin, customerPortalContext("ASSIGNMENT_RULE"), "manage"],
    [tenantAdmin, customerPortalContext("ASSIGNMENT_RULE"), "read"],
  ] as const)(
    "resolves the documented owner/tenant capability matrix",
    (principal, context, expected) => {
      expect(resolveSettingsAccess(principal, context)).toBe(expected);
    },
  );

  it("fails closed for unauthenticated, low-permission, cross-tenant, or incomplete context", () => {
    expect(resolveSettingsAccess(null, customerPortalContext("CATEGORY"))).toBe(
      "none",
    );
    expect(
      resolveSettingsAccess(
        { ...tenantAdmin, permission: 7 },
        customerPortalContext("CATEGORY"),
      ),
    ).toBe("none");
    expect(
      resolveSettingsAccess(
        { ...tenantAdmin, companyId: 3 },
        customerPortalContext("CATEGORY"),
      ),
    ).toBe("none");
    expect(
      resolveSettingsAccess(tenantAdmin, {
        resource: "CATEGORY",
        tenantCompanyId: 2,
      }),
    ).toBe("none");
  });

  it("treats manage as readable while keeping read-only access non-manageable", () => {
    expect(canReadServiceDeskSettings("manage")).toBe(true);
    expect(canReadServiceDeskSettings("read")).toBe(true);
    expect(canReadServiceDeskSettings("none")).toBe(false);
    expect(canManageServiceDeskSettings("manage")).toBe(true);
    expect(canManageServiceDeskSettings("read")).toBe(false);
  });
});
